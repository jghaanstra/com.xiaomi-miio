'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../lib/util.js');

class PhilipsColorBulbDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));
      this.registerCapabilityListener("dim", this.onCapabilityDim.bind(this));

      this.registerCapabilityListener('light_temperature', (value) => {
        try {
          if (this.miio) {
            const color_temp = this.util.denormalize(value, 1880, 7000);
            return this.miio.call("set_cct", [color_temp], { retries: 1 });
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

      this.registerCapabilityListener('light_hue', (value) => {
        try {
          if (this.miio) {
            return this.miio.call("set_cid", [value * 359], { retries: 1 });
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

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_prop", ["power", "bright", "cct", "cid"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] == "on");
      await this.updateCapabilityValue("dim", result[1] / 100);
      await this.updateCapabilityValue("light_temperature", this.util.normalize(result[2], 1880, 7000));
      await this.updateCapabilityValue("light_hue", result[3] / 359);

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

module.exports = PhilipsColorBulbDevice;
