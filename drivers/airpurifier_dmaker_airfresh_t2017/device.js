'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/dmaker.airfresh.t2017 // Mi Air Purifier MJXFJ-300-G1
// https://home.miot-spec.com/spec/dmaker.airfresh.a1 // Mi Air Purifier MJXFJ-150-A1

const modes = {
  0: "Auto",
  1: "Night",
  2: "Favorite",
  3: "Idle"
};

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

      this.registerCapabilityListener('airpurifier_zhimi_mode', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_mode", [+value], { retries: 1 });
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

    if (changedKeys.includes("sound")) {
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

      const result = await this.miio.call("get_prop", ["power", "pm25", "co2", "temperature_outside", "mode", "favourite_speed", "display", "sound", "child_lock", "ptc_on", "ptc_status"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0]);
      await this.updateCapabilityValue("measure_pm25", parseInt(result[1]));
      await this.updateCapabilityValue("measure_co2", parseInt(result[2]));
      await this.updateCapabilityValue("measure_temperature", parseInt(result[3]));
      
      await this.updateCapabilityValue("dim", parseInt(this.util.normalize[result[5]], 60, 300));
      await this.updateCapabilityValue("onoff.ptc", result[9]);

      await this.updateSettingValue("display", result[6]);
      await this.updateSettingValue("sound", result[7]);
      await this.updateSettingValue("childLock", result[8]);

      /* mode capability */
      if (this.getCapabilityValue('airpurifier_zhimi_mode') !== result[4].toString()) {
        const previous_mode = this.getCapabilityValue('airpurifier_zhimi_mode');
        await this.setCapabilityValue('airpurifier_zhimi_mode', result[4].toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[result[4]], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }
      
      /* model specific capabilities */
      switch (this.getStoreValue('model')) {
        case 'dmaker.airfresh.t2017':
          await this.util.sleep(2000);
          const result_t2017 = await this.miio.call("get_prop", ["ptc_level", "filter_efficient", "filter_intermediate", "screen_direction"], { retries: 1 });
          await this.updateCapabilityValue("air_heater_mode", result_t2017[0]);
          await this.updateSettingValue("filter_efficient", parseInt(result_t2017[1]).toString() + "%");
          await this.updateSettingValue("filter_intermediate", parseInt(result_t2017[2]).toString() + "%");
          await this.updateSettingValue("screen_direction", result_t2017[3]);
          break;
        case 'dmaker.airfresh.a1':
          await this.util.sleep(2000);
          const result_a1 = await this.miio.call("get_prop", ["filter_rate", "filter_day"], { retries: 1 });
          await this.updateSettingValue("filter_efficient", parseInt(result_a1[0]).toString() + "%");
          await this.updateSettingValue("filter_intermediate", parseInt(result_a1[0]).toString() + "%");
          break;
        default:
          break;
      }

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error.message);
    }
  }

}

module.exports = MiAirPurifierT2017Device;
