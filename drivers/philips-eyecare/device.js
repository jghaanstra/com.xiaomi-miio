'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class PhilipsEyecareDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});

      // TODO: remove this on the next release
      if (!this.hasCapability('onoff.ambilight')) { this.addCapability('onoff.ambilight'); }
      if (!this.hasCapability('onoff.eyecare')) { this.addCapability('onoff.eyecare'); }
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));
      this.registerCapabilityListener("dim", this.onCapabilityDim.bind(this));

      this.registerCapabilityListener('onoff.eyecare', (value) => {
        try {
          if (this.miio) {
            return this.miio.call("set_eyecare", [value ? "on" : "off"], { retries: 1 });
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

      this.registerCapabilityListener('onoff.ambilight', (value) => {
        try {
          if (this.miio) {
            return this.miio.call("enable_amb", [value ? "on" : "off"], { retries: 1 });
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

      const result = await this.miio.call("get_prop", ["power", "bright", "ambstatus", "eyecare"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("dim", result[1] / 100);
      await this.updateCapabilityValue("onoff.ambilight", result[2] === "on" ? true : false);
      await this.updateCapabilityValue("onoff.eyecare", result[3] === "on" ? true : false);

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

module.exports = PhilipsEyecareDevice;
