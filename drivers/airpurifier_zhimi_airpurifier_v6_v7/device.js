'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiAirPurifierV6V7Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.favoriteLevel = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 95, 100];

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_power", [value ? "on" : "off"], { retries: 1 });
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
            return await this.miio.call("set_level_favorite", [this.getFavoriteLevel(speed)], { retries: 1 });
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

      this.registerCapabilityListener('airpurifier_mode', async (value) => {
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

    if (changedKeys.includes("led")) {
      const led = await this.miio.call("set_led", [newSettings.led ? "on" : "off"], { retries: 1 });
    }

    if (changedKeys.includes("volume")) {
      const buzzer = await this.miio.call("set_volume", [newSettings.volume ? 100 : 0], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_child_lock", [newSettings.childLock ? "on" : "off"], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_prop", ["power", "aqi", "average_aqi", "humidity", "temp_dec", "bright", "mode", "favorite_level", "filter1_life", "use_time", "purify_volume", "led", "volume", "child_lock"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_pm25", parseInt(result[1]));
      await this.updateCapabilityValue("measure_humidity", parseInt(result[3]));
      await this.updateCapabilityValue("measure_temperature", parseInt(result[4] / 10));
      await this.updateCapabilityValue("measure_luminance", parseInt(result[5]));
      await this.updateCapabilityValue("air_purifier_mode", );
      await this.updateCapabilityValue("dim", parseInt(this.favoriteLevel[result[7]] / 100));

      await this.updateSettingValue("filter1_life", result[8] + "%");
      await this.updateSettingValue("purify_volume", result[10] + " m3");
      await this.updateSettingValue("led", result[11] == "on" ? true : false);
      await this.updateSettingValue("volume", result[12] >= 1 ? true : false);
      await this.updateSettingValue("childLock", result[13] == "on" ? true : false);

      /* mode trigger card */
      this.handleModeEvent(result[6]);

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
      if (this.getCapabilityValue('airpurifier_mode') !== mode) {
        const previous_mode = this.getCapabilityValue('airpurifier_mode');
        await this.setCapabilityValue('airpurifier_mode', mode);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

  getFavoriteLevel(speed) {
    for (var i = 1; i < this.favoriteLevel.length; i++) {
      if (speed > this.favoriteLevel[i - 1] && speed <= this.favoriteLevel[i]) {
        return i;
      }
    }

    return 1;
  }

}

module.exports = MiAirPurifierV6V7Device;
