'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiHumidifierV1Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');
      
      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.miio) {
            let humidity = value * 100;
            return await this.miio.call("set_target_humidity", [humidity], { retries: 1 });
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

      this.registerCapabilityListener('humidifier_mode', async ( value ) => {
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
    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_prop", ["power", "humidity", "temp_dec", "mode", "target_humidity", "led_b", "buzzer"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_humidity", parseInt(result[1]));
      await this.updateCapabilityValue("measure_temperature", parseInt(result[2] / 10));
      await this.updateCapabilityValue("dim", parseInt(result[4] / 100));
      
      await this.updateSettingValue("led", result[5] === 2 ? false : true);
      await this.updateSettingValue("buzzer", result[6] === "on" ? true : false);

      /* mode trigger card */
      this.handleModeEvent(result[3]);

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
      if (this.getCapabilityValue('humidifier_mode') !== mode) {
        const previous_mode = this.getCapabilityValue('humidifier_mode');
        await this.setCapabilityValue('humidifier_mode', mode);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiHumidifierV1Device;
