'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { siid: 2, piid: 1 },
  { siid: 2, piid: 5 },
  { siid: 2, piid: 6 },
  { siid: 2, piid: 7 },
  { siid: 2, piid: 8 },
  { siid: 2, piid: 9 },
  { siid: 2, piid: 10 },
  { siid: 2, piid: 11 },
  { siid: 3, piid: 7 },
  { siid: 3, piid: 9 },
  { siid: 4, piid: 1 },
  { siid: 5, piid: 2 },
  { siid: 6, piid: 1 },
  { siid: 7, piid: 1 },
  { siid: 7, piid: 3 },
  { siid: 7, piid: 5 }
];

const modes = {
  0: "Auto",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3"
};

class MiHumidifierCa4Device extends Device {

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

      this.registerCapabilityListener('onoff.dry', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 8, value }], { retries: 1 });
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
            return await this.miio.call("set_properties", [{ siid: 2, piid: 6, value: humidity }], { retries: 1 });
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

      this.registerCapabilityListener('humidifier_ca4_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 5, value: +value }], { retries: 1 });
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
      const led = await this.miio.call("set_properties", [{ siid: 5, piid: 2, value: newSettings.led ? 2 : 0 }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_properties", [{ siid: 4, piid: 1, value: newSettings.buzzer }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const childlock = await this.miio.call("set_properties", [{ siid: 6, piid: 1, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }
      
      const powerResult = result.filter(r => r.siid == 2 && r.piid == 1)[0];
      const deviceModeResult = result.filter(r => r.siid == 2 && r.piid == 5)[0];
      const deviceTargetHumidityResult = result.filter(r => r.siid == 2 && r.piid == 6)[0];
      const deviceWaterLevelResult = result.filter(r => r.siid == 2 && r.piid == 7)[0];
      const deviceDryResult = result.filter(r => r.siid == 2 && r.piid == 8)[0];
      const deviceSpeedLevelResult = result.filter(r => r.siid == 2 && r.piid == 11)[0];
      const deviceTemperatureResult = result.filter(r => r.siid == 3 && r.piid == 7)[0];
      const deviceHumidityResult = result.filter(r => r.siid == 3 && r.piid == 9)[0];
      const deviceBuzzerResult = result.filter(r => r.siid == 4 && r.piid == 1)[0];
      const deviceLedBrightnessResult = result.filter(r => r.siid == 5 && r.piid == 2)[0];
      const deviceChildLockResult = result.filter(r => r.siid == 6 && r.piid == 1)[0];

      await this.updateCapabilityValue("onoff", powerResult.value);
      await this.updateCapabilityValue("onoff.dry", deviceDryResult.value);
      await this.updateCapabilityValue("measure_humidity", +deviceHumidityResult.value);
      await this.updateCapabilityValue("measure_temperature", +deviceTemperatureResult.value);
      await this.updateCapabilityValue("dim", (+deviceSpeedLevelResult.value / 200) * 10);
      await this.updateCapabilityValue("dim.target", +deviceTargetHumidityResult.value);
      await this.updateCapabilityValue("measure_water", +deviceWaterLevelResult.value);

      await this.setSettings({ led: !!deviceLedBrightnessResult.value });
      await this.setSettings({ buzzer: deviceBuzzerResult.value });
      await this.setSettings({ childLock: deviceChildLockResult.value });

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
      if (this.getCapabilityValue('humidifier_ca4_mode') !== mode.toString()) {
        const previous_mode = this.getCapabilityValue('humidifier_ca4_mode');
        await this.setCapabilityValue('humidifier_ca4_mode', mode.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiHumidifierCa4Device;
