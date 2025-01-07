"use strict";

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.fan.v2
// https://home.miot-spec.com/spec/zhimi.fan.v3
// https://home.miot-spec.com/spec/zhimi.fan.sa1
// https://home.miot-spec.com/spec/zhimi.fan.za1
// https://home.miot-spec.com/spec/zhimi.fan.za3
// https://home.miot-spec.com/spec/zhimi.fan.za4

const modes = {
  1: "Natural Wind",
  2: "Straight Wind"
};

class ZhiMiFanAdvancedDevice extends Device {

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

      this.registerCapabilityListener('oscillating', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_angle_enable", [value ? "on" : "off"], { retries: 1 });
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

      this.registerCapabilityListener('fan_speed', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_speed_level", [value * 100], { retries: 1 });
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

      this.registerCapabilityListener('measure_wind_angle', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_angle", [value], { retries: 1 });
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

      this.registerCapabilityListener('fan_zhimi_mode', async ( value ) => {
        try {
          if (this.miio) {
            if (this.getStoreValue('model') === 'zhimi.fan.sa1' || this.getStoreValue('model') === 'zhimi.fan.za1') {
              value = +value + 1;
            }
            return await this.miio.call("set_natural_level", [+value], { retries: 1 });
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
      const led = await this.miio.call("set_led_b", [newSettings.led ? 1 : 0], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_buzzer", [newSettings.buzzer ? 1 : 0], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_child_lock", [newSettings.childLock ? "on" : "off"], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_prop", ["power", "angle", "angle_enable", "speed_level", "natural_level", "child_lock", "buzzer", "led_b"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* capabilities */
      await this.updateCapabilityValue("onoff", result[0] == "on");
      await this.updateCapabilityValue("measure_wind_angle", +result[1]);
      await this.updateCapabilityValue("oscillating", result[2] == "on");
      await this.updateCapabilityValue("fan_speed", result[3] / 100);

      /* settings */
      await this.updateSettingValue("childLock", result[5] == "on");
      await this.updateSettingValue("buzzer",!!result[6]);
      await this.updateSettingValue("led", !!result[7]);

      /* mode capability */
      let mode;
      if (this.getStoreValue('model') === 'zhimi.fan.sa1' || this.getStoreValue('model') === 'zhimi.fan.za1') {
        mode = result[4] - 1;
      } else {
        mode = result[4]
      }
      if (mode <= 1 && this.getCapabilityValue('fan_zhimi_mode') !== mode.toString()) {
        const previous_mode = this.getCapabilityValue('fan_zhimi_mode');
        await this.setCapabilityValue('fan_zhimi_mode', mode.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }

      /* zhimi.fan.v2 & zhimi.fan.v3 */
      if (this.getStoreValue('model') === 'zhimi.fan.v2' || this.getStoreValue('model') === 'zhimi.fan.v3') {
        await this.util.sleep(2000);
        const resultv2 = await this.miio.call("get_prop", ["battery", "humidity", "temp_dec"], { retries: 1 });

        await this.updateCapabilityValue("measure_battery", +resultv2[0]);
        await this.updateCapabilityValue("measure_humidity", +resultv2[1]);
        await this.updateCapabilityValue("measure_temperature", +resultv2[2] / 10);
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

module.exports = ZhiMiFanAdvancedDevice;