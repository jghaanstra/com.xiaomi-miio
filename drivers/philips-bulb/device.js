'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../lib/util.js');

class PhilipsBulbDevice extends Device {

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
            const colorvalue = this.util.denormalize(value, 3000, 5700);
            const colortemp = ''+ colorvalue +'K';
            return this.miio.color(colortemp);
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

}

module.exports = PhilipsBulbDevice;
