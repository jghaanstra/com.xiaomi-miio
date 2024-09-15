'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.airpurifier.v1 // Air Purifier
// https://home.miot-spec.com/spec/zhimi.airpurifier.v2 // Air Purifier v2
// https://home.miot-spec.com/spec/zhimi.airpurifier.v3 // Air Purifier v3
// https://home.miot-spec.com/spec/zhimi.airpurifier.v5 // Air Purifier v5
// https://home.miot-spec.com/spec/zhimi.airpurifier.v6 // Air Purifier Pro
// https://home.miot-spec.com/spec/zhimi.airpurifier.v7 // Air Purifier Pro v7
// https://home.miot-spec.com/spec/zhimi.airpurifier.m1 // Air Purifier 2 Mini
// https://home.miot-spec.com/spec/zhimi.airpurifier.m2 // Air Purifier Mini
// https://home.miot-spec.com/spec/zhimi.airpurifier.ma1 // Air Purifier 2S
// https://home.miot-spec.com/spec/zhimi.airpurifier.ma2 // Air Purifier 2S
// https://home.miot-spec.com/spec/zhimi.airpurifier.sa1 // Air Purifier Super/Max
// https://home.miot-spec.com/spec/zhimi.airpurifier.sa2 // Air Purifier Super/Max 2
// https://home.miot-spec.com/spec/zhimi.airpurifier.mc1 // Air Purifier 2S
// https://home.miot-spec.com/spec/zhimi.airpurifier.mc2 // Air Purifier 2H

class AdvancedOlderMiAirPurifierDevice extends Device {

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
            return await this.miio.call("set_level_favorite", [value], { retries: 1 });
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

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_buzzer", [newSettings.buzzer ? "on" : "off"], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_child_lock", [newSettings.childLock ? "on" : "off"], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_prop", ["power", "aqi", "humidity", "temp_dec", "bright", "mode", "favorite_level", "buzzer", "led", "child_lock", "filter1_life", "f1_hour_used" ], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* capabilities */
      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_pm25", result[1]);
      await this.updateCapabilityValue("measure_humidity", result[2]);
      await this.updateCapabilityValue("measure_temperature", result[3] / 10);
      await this.updateCapabilityValue("measure_luminance", result[4]);
      await this.updateCapabilityValue("dim", result[6]);

      /* settings */
      await this.updateSettingValue("buzzer", result[7] === "on" ? true : false);
      await this.updateSettingValue("led", result[8] === "on" ? true : false);
      await this.updateSettingValue("childLock", result[9] == "on" ? true : false);
      await this.updateSettingValue("filter1_life", result[10] + "%");
      await this.updateSettingValue("f1_hour_used", result[11] + "h");   

      /* mode capability */
      if (this.getCapabilityValue('airpurifier_mode') !== result[5]) {
        const previous_mode = this.getCapabilityValue('airpurifier_mode');
        await this.setCapabilityValue('airpurifier_mode', result[5]);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": result[5], "previous_mode": previous_mode }).catch(error => { this.error(error) });
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

module.exports = AdvancedOlderMiAirPurifierDevice;