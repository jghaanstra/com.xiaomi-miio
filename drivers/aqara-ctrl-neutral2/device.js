'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraNeutral2Switch extends Device {

  async registerCapabilities() {

    this.registerCapabilityListener('onoff.0', async (value) => {
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
      if (!this.getAvailable()) { this.setAvailable(); }

      /* onoff left switch */
      if (device.data["channel_0"]) {
        await this.updateCapabilityValue("onoff.0", device.data["channel_0"] == "on" ? true : false);
  
        if (device.data["channel_0"] == "on") {
          await this.homey.flow.getDeviceTriggerCard('leftSwitchOn').trigger(this).catch(error => { this.error(error) });
        } else if (device.data["channel_0"] == "off") {
          await this.homey.flow.getDeviceTriggerCard('leftSwitchOff').trigger(this).catch(error => { this.error(error) });
        }
      }

      /* onoff right switch */
      if (device.data.channel_1) {
        await this.updateCapabilityValue("onoff.1", device.data.channel_1 === "on" ? true : false);
  
        if (device.data.channel_1 === "on") {
          await this.homey.flow.getDeviceTriggerCard('rightSwitchOn').trigger(this).catch(error => { this.error(error) });
        } else if (device.data.channel_1 === "off") {
          await this.homey.flow.getDeviceTriggerCard('rightSwitchOff').trigger(this).catch(error => { this.error(error) });
        }
      }
      
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = AqaraNeutral2Switch;