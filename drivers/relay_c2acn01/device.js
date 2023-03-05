'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class RelayC2ACN01Device extends Device {

  async registerCapabilities() {
    this.registerCapabilityListener('onoff', async (value) => {
      try {
        return await this.homey.app.mihub.sendWrite(this.data.sid, { channel_0: value ? "on" : "off" });
      } catch (error) {
        this.error(error);
      }
    });
    this.registerCapabilityListener('onoff.1', async (value) => {
      try {
        return await this.homey.app.mihub.sendWrite(this.data.sid, { channel_1: value ? "on" : "off" });
      } catch (error) {
        this.error(error);
      }
    });
  }

  async onEventFromGateway(device) {
    try {

      /* onoff left switch */
      if (device && device.data && device.data["channel_0"]) { await this.updateCapabilityValue("onoff", device.data["channel_0"] == "on" ? true : false); }

      /* onoff right switch */
      if (device && device.data && device.data["channel_1"]) {
        await this.updateCapabilityValue("onoff.1", device.data["channel_1"] == "on" ? true : false);
  
        if (device && device.data && device.data["channel_1"] == "on") {
          await this.homey.flow.getDeviceTriggerCard('rightSwitchOn').trigger(this).catch(error => { this.error(error) });
        } else if (device && device.data && device.data["channel_1"] == "off") {
          await this.homey.flow.getDeviceTriggerCard('rightSwitchOff').trigger(this).catch(error => { this.error(error) });
        }
      }

      /* measure_power */
      if (device && device.data && device.data["load_power"]) {
        await this.updateCapabilityValue("measure_power", parseInt(device.data["load_power"]));
      }

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = RelayC2ACN01Device;