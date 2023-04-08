'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { siid: 2, piid: 1 },
  { siid: 2, piid: 2 },
  { siid: 2, piid: 4 },
  { siid: 3, piid: 4 },
  { siid: 6, piid: 1 },
  { siid: 7, piid: 2 },
  { siid: 8, piid: 1 },
  { siid: 9, piid: 3 },
];

const modes = {
  "auto": 0,
  "night": 1,
  "favorite": 2
};

class MiAirPurifier3CDevice extends Device {

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

      this.registerCapabilityListener('dim', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 9, piid: 3, value: +value }], { retries: 1 });
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

      this.registerCapabilityListener('airpurifier_zhimi_airpurifier_mb4_mode', async (value) => {
        try {
          if (this.miio) {
            const mode = modes[value];
            return await this.miio.call("set_properties", [{ siid: 2, piid: 4, value: mode }], { retries: 1 });
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
      const led = await this.miio.call("set_properties", [{ siid: 7, piid: 2, value: newSettings.led ? 8 : 0 }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_properties", [{ siid: 6, piid: 1, value: newSettings.buzzer }], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_properties", [{ siid: 8, piid: 1, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }
      const powerResult = result.filter((r) => r.siid == 2 && r.piid == 1)[0];
      const deviceModeResult = result.filter((r) => r.siid == 2 && r.piid == 4)[0];
      const deviceFanLevelResult = result.filter((r) => r.siid == 9 && r.piid == 3)[0];
      const devicePM25Result = result.filter((r) => r.siid == 3 && r.piid == 4)[0];
      const deviceBuzzerResult = result.filter((r) => r.siid == 6 && r.piid == 1)[0];
      const deviceLedBrightnessResult = result.filter((r) => r.siid == 7 && r.piid == 2)[0];
      const deviceChildLockResult = result.filter((r) => r.siid == 8 && r.piid == 1)[0];

      await this.updateCapabilityValue("onoff", powerResult.value);
      await this.updateCapabilityValue("dim", +deviceFanLevelResult.value);
      await this.updateCapabilityValue("measure_pm25", +devicePM25Result.value);

      await this.updateSettingValue("led", !!deviceLedBrightnessResult.value);
      await this.updateSettingValue("buzzer", deviceBuzzerResult.value);
      await this.updateSettingValue("childLock", deviceChildLockResult.value);

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
      let new_mode = '';

      switch (mode) {
        case '0':
        case 'auto':
          new_mode = 'auto';
          break;
        case '1':
        case 'night':
          new_mode = 'night';
          break;
        case '2':
        case 'favorite':
          new_mode = 'favorite';
          break;
        case '3':
        case 'idle':
          new_mode = 'idle';
          break;
      }

      if (this.getCapabilityValue('airpurifier_zhimi_airpurifier_mb4_mode') !== new_mode) {
        const previous_mode = this.getCapabilityValue('airpurifier_zhimi_airpurifier_mb4_mode');
        await this.setCapabilityValue('airpurifier_zhimi_airpurifier_mb4_mode', new_mode);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": new_mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiAirPurifier3CDevice;
