'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiAirPurifierT2017Device extends Device {

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
            return await this.miio.call("set_power", [value], { retries: 1 });
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

      this.registerCapabilityListener('onoff.ptc', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_ptc_on", [value], { retries: 1 });
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
            let speed = value * 100;
            if (speed > 0) {
              return await this.miio.call("set_favourite_speed", [parseInt(speed * 2.4 + 60)], { retries: 1 });
            }
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

      this.registerCapabilityListener('airpurifier_heater_mode', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_ptc_level", [value], { retries: 1 });
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

      this.registerCapabilityListener('airpurifier_zhimi_airpurifier_mode', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_mode", [value], { retries: 1 });
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

    if (changedKeys.includes("display")) {
      const led = await this.miio.call("set_display", [newSettings.display ? "on" : "off"], { retries: 1 });
    }

    if (changedKeys.includes("volume")) {
      const buzzer = await this.miio.call("set_sound", [newSettings.sound ? "on" : "off"], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_child_lock", [newSettings.childLock ? "on" : "off"], { retries: 1 });
    }

    if (changedKeys.includes("screen_direction")) {
      const childlock = await this.miio.call("set_screen_direction", [newSettings.screen_direction], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_prop", ["power", "pm25", "co2", "temperature_outside", "mode", "ptc_level", "favourite_speed", "display", "sound", "child_lock", "filter_efficient", "filter_intermediate", "screen_direction", "ptc_level", "ptc_on", "ptc_status"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0]);
      await this.updateCapabilityValue("measure_pm25", parseInt(result[1]));
      await this.updateCapabilityValue("measure_co2", parseInt(result[2]));
      await this.updateCapabilityValue("measure_temperature", parseInt(result[3]));
      await this.updateCapabilityValue("air_heater_mode", result[5]);
      await this.updateCapabilityValue("dim", parseInt(this.util.normalize[result[6]], 60, 300));
      await this.updateCapabilityValue("onoff.ptc", result[14]);
      if (result[13] && result[14]) {
        await this.updateCapabilityValue("air_heater_mode", result[13]);
      } else {
        await this.updateCapabilityValue("air_heater_mode", "off");
      }

      await this.updateSettingValue("childLock", result[9]);
      await this.updateSettingValue("display", result[7]);
      await this.updateSettingValue("filter_efficient", parseInt(result[10]).toString() + "%");
      await this.updateSettingValue("filter_intermediate", parseInt(result[11]).toString() + "%");
      await this.updateSettingValue("screen_direction", result[12]);

      /* mode trigger card */
      this.handleModeEvent(result[4]);

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
      if (this.getCapabilityValue('airpurifier_zhimi_airpurifier_mode') !== mode) {
        const previous_mode = this.getCapabilityValue('airpurifier_zhimi_airpurifier_mode');
        await this.setCapabilityValue('airpurifier_zhimi_airpurifier_mode', mode);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiAirPurifierT2017Device;
