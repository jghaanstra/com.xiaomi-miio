'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.airfresh.va2
// https://home.miot-spec.com/spec/zhimi.airfresh.va4

class MiAirFreshDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // TODO: remove with the next release
      if (this.getClass() !== 'airpurifier') {
        this.log('Updating device class from', this.getClass(), 'to airpurifier');
        this.setClass('airpurifier')
      }

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

      this.registerCapabilityListener('onoff.ptc', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_ptc_state", [value ? "on" : "off"], { retries: 1 });
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

      this.registerCapabilityListener('airpurifier_zhimi_airfresh_mode', async (value) => {
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
      const led = await this.miio.call("set_led_level", [newSettings.led ? 0 : 2], { retries: 1 });
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

      const result = await this.miio.call("get_prop", ["power", "temp_dec", "aqi", "co2", "humidity", "mode", "buzzer", "child_lock", "led_level", "f1_hour_used", "motor1_speed" ], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* capabilities */
      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_temperature", parseFloat(result[1]));
      await this.updateCapabilityValue("measure_pm25", parseInt(result[2]));
      await this.updateCapabilityValue("measure_co2", parseInt(result[3]));
      await this.updateCapabilityValue("measure_humidity", parseFloat(result[4]));

      /* settings */
      await this.updateSettingValue("buzzer", result[6] == "on" ? true : false);
      await this.updateSettingValue("childLock", result[7] == "on" ? true : false);
      await this.updateSettingValue("led", result[8] === 0 || 1 ? true : false);
      await this.updateSettingValue("f1_hour_used", Math.round(result[9] / 24) + " days used");
      await this.updateSettingValue("motor_speed", result[10]);

      /* mode capability */
      if (this.getCapabilityValue('airpurifier_zhimi_airfresh_mode') !== result[5]) {
        const previous_mode = this.getCapabilityValue('airpurifier_zhimi_airfresh_mode');
        await this.setCapabilityValue('airpurifier_zhimi_airfresh_mode', result[5]);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }

      /* model specific capabilities */
      switch (this.getStoreValue('model')) {
        case 'zhimi.airfresh.va4':
          await this.util.sleep(2000);
          const result_va4 = await this.miio.call("get_prop", ["ptc_state"], { retries: 1 });
          if (!this.hasCapability('onoff.ptc')) { await this.addCapability('onoff.ptc')};
          await this.updateCapabilityValue("onoff.ptc", result_va4[0] === "on" ? true : false);
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

  async handleModeEvent(mode) {
    try {
      
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiAirFreshDevice;