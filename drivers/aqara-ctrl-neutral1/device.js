'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraNeutralSwitch extends Device {

  async registerCapabilities() {
    this.registerCapabilityListener('onoff', async (value) => {
      try {
        return await this.homey.app.mihub.sendWrite(this.data.sid, { channel_0: value ? "on" : "off" });
      } catch (error) {
        this.error(error);
      }
    });
  }

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* onoff */
      if (device.data.channel_0) { await this.updateCapabilityValue("onoff", device.data.channel_0 === "on" ? true : false); }

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = AqaraNeutralSwitch;