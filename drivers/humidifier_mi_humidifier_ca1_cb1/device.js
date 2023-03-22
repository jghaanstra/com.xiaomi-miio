'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiHumidifierCa1Cb1Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

      this.registerCapabilityListener('onoff.dry', async ( value ) => {
        try {
          if (this.miio) {
            let humidity = value * 100;
            if (humidity > 0) {
              return await this.miio.call("set_dry", [value ? "on" : "off"]);
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

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.miio) {
            let humidity = value * 100;
            return await this.miio.call("set_limit_hum", [humidity]);
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

      this.registerCapabilityListener('humidifier2_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_mode", [value]);
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
      const result = await this.miio.call("get_prop", ["power", "humidity", "temperature", "mode", "limit_hum", "depth", "dry", "led_b", "buzzer", "child_lock"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("measure_humidity", parseInt(result[1]));
      await this.updateCapabilityValue("measure_temperature", parseInt(result[2]));
      await this.updateCapabilityValue("dim", parseInt(result[4] / 100));
      await this.updateCapabilityValue("measure_water", parseInt(result[5]));
      await this.updateCapabilityValue("onoff.dry", result[6] === "on" ? true : false);
      
      await this.setSettings({ led: result[7] === 2 ? false : true });
      await this.setSettings({ buzzer: result[8] === "on" ? true : false });
      await this.setSettings({ childLock: result[9] === "on" ? true : false });

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
      if (this.getCapabilityValue('humidifier2_mode') !== mode) {
        const previous_mode = this.getCapabilityValue('humidifier2_mode');
        await this.setCapabilityValue('humidifier2_mode', mode);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiHumidifierCa1Cb1Device;
