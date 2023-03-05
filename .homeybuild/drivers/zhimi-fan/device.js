"use strict";

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class ZhiMiFanDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = ZhiMiFanDevice;