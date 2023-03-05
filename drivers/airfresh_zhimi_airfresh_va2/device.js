'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiAirFreshVA2Device extends Device {

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
            return await this.miio.call("set_motor1", [speed * 10.3], { retries: 1 });
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

      this.registerCapabilityListener('airfresh_mode', async (value) => {
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

      const result = await this.miio.call("get_prop", ["power", "mode", "aqi", "co2", "humidity", "temp_dec", "motor1_speed", "led", "buzzer", "child_lock", "f1_hour_used"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_pm25", parseInt(result[2]));
      await this.updateCapabilityValue("measure_co2", parseInt(result[3]));
      await this.updateCapabilityValue("measure_humidity", parseInt(result[4]));
      await this.updateCapabilityValue("measure_temperature", parseInt(result[5] / 10));
      await this.updateCapabilityValue("dim", parseInt(parseInt(result[6] / 10.3) / 100));
      
      await this.setSettings({ led: result[7] == "on" ? true : false });
      await this.setSettings({ buzzer: result[8] == "on" ? true : false });
      await this.setSettings({ childLock: result[9] == "on" ? true : false });
      await this.setSettings({ f1_hour_used: result[10] + "%" });

      /* mode trigger card */
      this.handleModeEvent(result[1]);

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
      if (this.getCapabilityValue('airfresh_mode') !== mode) {
        const previous_mode = this.getCapabilityValue('airfresh_mode');
        await this.setCapabilityValue('airfresh_mode', mode);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiAirFreshVA2Device;