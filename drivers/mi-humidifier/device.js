'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiHumidifierDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});

      // TODO: remove this driver after the next public release
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiHumidifierDevice;
