'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.humidifier.v1
// https://home.miot-spec.com/spec/zhimi.humidifier.ca1
// https://home.miot-spec.com/spec/zhimi.humidifier.cb1
// https://home.miot-spec.com/spec/zhimi.humidifier.cb2

class MiHumidifierDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE SPECIFIC INIT ACTIONS
      if (this.getStoreValue('model') !== 'zhimi.humidifier.v1') {
        if (!this.hasCapability('measure_waterlevel')) {
          this.addCapability('measure_waterlevel');
        }
      }

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');
      this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

      this.registerCapabilityListener('onoff.dry', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_dry", [value ? "on" : "off"]);
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
            return await this.miio.call("set_limit_hum", [value], { retries: 1 });
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

      this.registerCapabilityListener('humidifier_zhimi_mode', async ( value ) => {
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
      const led = await this.miio.call("set_led_b", [newSettings.led ? 1 : 0]);
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_buzzer", [newSettings.buzzer ? "on" : "off"]);
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_child_lock", [newSettings.childLock ? "on" : "off"]);
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      // BASIC CAPABILITIES
      const result = await this.miio.call("get_prop", ["power", "mode", "humidity", "buzzer", "led_b", "child_lock", "limit_hum"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* capabilities */
      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_humidity", result[2]);
      await this.updateCapabilityValue("dim", result[6]);
      
      /* settings */
      await this.updateSettingValue("led", result[4] === 2 ? false : true);
      await this.updateSettingValue("buzzer", result[3] === "on" ? true : false);
      await this.updateSettingValue("childLock", result[5] === "on" ? true : false);

      /* mode capability */
      if (this.getCapabilityValue('humidifier_zhimi_mode') !== result[1]) {
        const previous_mode = this.getCapabilityValue('humidifier_zhimi_mode');
        await this.setCapabilityValue('humidifier_zhimi_mode', result[1]);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": result[1], "previous_mode": previous_mode.toString() }).catch(error => { this.error(error) });
      }

      /* model specific capabilities */
      switch (this.getStoreValue('model')) {
        case 'zhimi.humidifier.v1':
          await this.util.sleep(2000);
          const result_extra_props_v1 = await this.miio.call("get_prop", ["temp_dec"], { retries: 1 });
          await this.updateCapabilityValue("measure_temperature", result_extra_props_v1[0] / 10);
          break;
        case 'zhimi.humidifier.ca1':
          await this.util.sleep(2000);
          const result_extra_props_ca1 = await this.miio.call("get_prop", ["temp_dec", "depth"], { retries: 1 });
          await this.updateCapabilityValue("measure_temperature", result_extra_props_ca1[0] / 10);
          const measure_waterlevel_ca1 = this.util.normalize(result_extra_props_ca1[1], 0 , 120) * 100;
          if (this.getCapabilityValue('measure_waterlevel') !== measure_waterlevel_ca1) {
            const previous_waterlevel = await this.getCapabilityValue('measure_waterlevel');
            await this.setCapabilityValue('measure_waterlevel', measure_waterlevel_ca1);
            await this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel').trigger(this, {"waterlevel": measure_waterlevel_ca1, "previous_waterlevel": previous_waterlevel }).catch(error => { this.error(error) });
          }
          break;
        case 'zhimi.humidifier.cb1':
        case 'zhimi.humidifier.cb2':
          await this.util.sleep(2000);
          const result_extra_props_cb = await this.miio.call("get_prop", ["temperature", "depth", "dry"], { retries: 1 });
          await this.updateCapabilityValue("measure_temperature", result_extra_props_cb[0]);
          await this.updateCapabilityValue("onoff.dry", result_extra_props_cb[2] === "on" ? true : false);
          const measure_waterlevel_cb_value = this.util.normalize(result_extra_props_cb[1], 0 , 120) * 100;
          const measure_waterlevel_cb = this.util.clamp(measure_waterlevel_cb_value, 0 , 100);
          if (this.getCapabilityValue('measure_waterlevel') !== measure_waterlevel_cb) {
            const previous_waterlevel = await this.getCapabilityValue('measure_waterlevel');
            await this.setCapabilityValue('measure_waterlevel', measure_waterlevel_cb);
            await this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel').trigger(this, {"waterlevel": measure_waterlevel_cb, "previous_waterlevel": previous_waterlevel }).catch(error => { this.error(error) });
          }
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

module.exports = MiHumidifierDevice;
