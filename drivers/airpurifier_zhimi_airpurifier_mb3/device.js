'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { siid: 2, piid: 1 }, //fault - uint8
  { siid: 2, piid: 2 }, //status - bool
  { siid: 2, piid: 4 }, //fan level - uint8
  { siid: 2, piid: 5 }, //mode - uint8
  { siid: 3, piid: 6 }, //pm2.5 - float
  { siid: 3, piid: 7 }, //humidity - uint8
  { siid: 3, piid: 8 }, //temperature - float
  { siid: 6, piid: 1 }, //led - uint8
  { siid: 7, piid: 1 }, //lock - bool
  { siid: 4, piid: 3 }, //filter life - uint8
  { siid: 13, piid: 1 }, //purify volume - int32
];

const modes = {
  "auto": 0,
  "night": 1,
  "favorite": 2,
  "idle": 3,
  0: "auto",
  1: "night",
  2: "favorite",
  3: "idle"
};

class MiAirPurifier3HDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 2, value }], { retries: 1 });
          } else {
            this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
            this.createDevice();
            return Promise.reject('Device unreachable, please try again ...');
          }
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('dim', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 4, value }], { retries: 1 });
          } else {
            this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
            this.createDevice();
            return Promise.reject('Device unreachable, please try again ...');
          }
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('airpurifier_zhimi_airpurifier_mb3_mode', async (value) => {
        try {
          if (this.miio) {
            const mode = modes[value];
            return await this.miio.call("set_properties", [{ siid: 2, piid: 5, value: modes[mode] }], { retries: 1 });
          } else {
            this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
            this.createDevice();
            return Promise.reject('Device unreachable, please try again ...');
          }
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

    } catch (error) {
      this.error(error);
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys.includes("address") || changedKeys.includes("token") || changedKeys.includes("polling")) {
      this.refreshDevice();
    }

    if (changedKeys.includes("led")) {
      const led = await this.miio.call("set_properties", [{ siid: 6, piid: 1, value }], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_properties", [{ siid: 7, piid: 1, value }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }
      const deviceStatusResult = result.filter((r) => r.siid == 2 && r.piid == 2)[0];
      const deviceFanLevelResult = result.filter((r) => r.siid == 2 && r.piid == 4)[0];
      const deviceModeResult = result.filter((r) => r.siid == 2 && r.piid == 5)[0];
      const devicepm25Result = result.filter((r) => r.siid == 3 && r.piid == 6)[0];
      const deviceHumidityResult = result.filter((r) => r.siid == 3 && r.piid == 7)[0];
      const deviceTemperatureResult = result.filter((r) => r.siid == 3 && r.piid == 8)[0];
      const deviceLedResult = result.filter((r) => r.siid == 6 && r.piid == 1)[0];
      const deviceLockResult = result.filter((r) => r.siid == 7 && r.piid == 1)[0];
      const deviceFilterLifeLevelResult = result.filter((r) => r.siid == 4 && r.piid == 3)[0];
      const devicePurifierVolumeResult = result.filter((r) => r.siid == 13 && r.piid == 1)[0];

      await this.updateCapabilityValue("onoff", deviceStatusResult.value);
      await this.updateCapabilityValue("measure_pm25", +devicepm25Result.value);
      await this.updateCapabilityValue("measure_humidity", +deviceHumidityResult.value);
      await this.updateCapabilityValue("measure_temperature", +deviceTemperatureResult.value);
      await this.updateCapabilityValue("dim", deviceFanLevelResult.value);
      
      await this.updateSettingValue("filter1_life", deviceFilterLifeLevelResult.value + "%");
      await this.updateSettingValue("purify_volume", devicePurifierVolumeResult.value + " m3");
      await this.updateSettingValue("led", !!deviceLedResult.value);
      await this.updateSettingValue("childLock", deviceLockResult.value);

      /* mode trigger card */
      this.handleModeEvent(deviceModeResult.value);
      
    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error.message);
    }
  }

  async handleModeEvent(mode) {
    try {
      if (this.getCapabilityValue('airpurifier_zhimi_airpurifier_mb3_mode') !== modes[mode]) {
        const previous_mode = this.getCapabilityValue('airpurifier_zhimi_airpurifier_mb3_mode');
        await this.setCapabilityValue('airpurifier_zhimi_airpurifier_mb3_mode', modes[mode]);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiAirPurifier3HDevice;
