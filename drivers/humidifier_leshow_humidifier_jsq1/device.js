'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { siid: 2, piid: 1 }, //status - bool
  { siid: 2, piid: 2 }, //fault - uint8
  { siid: 2, piid: 3 }, //mode - uint8
  { siid: 2, piid: 6 }, //target humidity - uint8
  { siid: 3, piid: 1 }, //humidity - uint8
  { siid: 8, piid: 1 }, //water level - uint8
  { siid: 8, piid: 6 }, //screen brightness - uint8
];

const modes = {
  0: "Constant",
  1: "High",
  2: "Sleep"
};

class MiHumidifierLeshowJSQ1Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 1, value }], { retries: 1 });
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

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.miio) {
            const humidity = value * 100;
            return await this.miio.call("set_properties", [{ siid: 2, piid: 6, humidity }], { retries: 1 });
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

      this.registerCapabilityListener('humidifier_leshow_jsq1_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 3, value: +value }], { retries: 1 });
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
      const led = await this.miio.call("set_properties", [{ siid: 8, piid: 6, value: newSettings.led ? 1 : 0 }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      const deviceStatusResult = result.filter((r) => r.siid == 2 && r.piid == 1)[0];
      const deviceModeResult = result.filter((r) => r.siid == 2 && r.piid == 3)[0];
      const deviceTargetHumidityResult = result.filter((r) => r.siid == 2 && r.piid == 6)[0];
      const deviceHumidityResult = result.filter((r) => r.siid == 3 && r.piid == 1)[0];
      const deviceWaterLevelResult = result.filter((r) => r.siid == 8 && r.piid == 1)[0];
      const deviceLedResult = result.filter((r) => r.siid == 8 && r.piid == 6)[0];

      await this.updateCapabilityValue("onoff", deviceStatusResult.value);
      await this.updateCapabilityValue("measure_humidity", deviceHumidityResult.value / 100);
      await this.updateCapabilityValue("dim", deviceTargetHumidityResult.value);
      await this.updateCapabilityValue("measure_water", deviceWaterLevelResult.value);
      
      await this.setSettings({ led: !!deviceLedResult.value });

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
      if (this.getCapabilityValue('humidifier_leshow_jsq1_mode') !== mode.toString()) {
        const previous_mode = this.getCapabilityValue('humidifier_leshow_jsq1_mode');
        await this.setCapabilityValue('humidifier_leshow_jsq1_mode', mode.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiHumidifierLeshowJSQ1Device;
