'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiHumidifierDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // TODO: remove with the next release
      if (this.getClass() !== 'humidifier') {
        this.log('Updating device class from', this.getClass(), 'to humidifier');
        this.setClass('humidifier')
      }

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiHumidifierDevice;
