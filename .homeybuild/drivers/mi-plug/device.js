'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class MiPlug extends Device {

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

      /* onoff */
      if (device && device.data && device.data["status"] == "on") { await this.updateCapabilityValue("onoff", true); }
      if (device && device.data && device.data["status"] == "off") { await this.updateCapabilityValue("onoff", false); }

      if (device && device.data && device.data["inuse"]) {
        if (this.getStoreValue('inUse') !== !!parseInt(device.data["inuse"]) && !!parseInt(device.data["inuse"])) {
          await this.homey.flow.getDeviceTriggerCard('triggerPlugInUse').trigger(this).catch(error => { this.error(error) });
        }
        this.setStoreValue('inUse', !!parseInt(device.data["inuse"]))
      }

      /* measure_power */
      if (device && device.data && device.data["load_power"]) {
        await this.updateCapabilityValue("measure_power", parseInt(device.data["load_power"]));
      }

      /* meter_power */
      if (device && device.data && device.data["power_consumed"]) {
        await this.updateCapabilityValue("meter_power", parseFloat(device.data["power_consumed"] / 1000));
      }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiPlug;