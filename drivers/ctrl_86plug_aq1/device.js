'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraWallOutletDevice extends Device {

  async registerCapabilities() {
    this.registerCapabilityListener('onoff', async (value) => {
      try {
        return await this.homey.app.mihub.sendWrite(this.data.sid, { status: value });
      } catch (error) {
        this.error(error);
      }
    });
  }

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* onoff */
      if (device && device.data && device["data"]["status"] == "on") { await this.updateCapabilityValue("onoff", true, triggers.power); }
      if (device && device.data && device["data"]["status"] == "off") { await this.updateCapabilityValue("onoff", false, triggers.power); }
  
      /* measure_power */
      if (device && device.data && device["data"]["load_power"]) { await this.updateCapabilityValue("measure_power", parseInt(device["data"]["load_power"])); }
  
      /* meter_power */
      if (device && device.data && device["data"]["power_consumed"]) { await this.updateCapabilityValue("meter_power", parseInt(device["data"]["power_consumed"] / 1000)); }

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = AqaraWallOutletDevice;