'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class MiMagnetSensor extends Device {

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* measure_battery & alarm_battery */
      if (device.data.voltage) {
        const battery = (device.data.voltage - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }
  
      /* alarm_contact */
      if (device.data.status === "open") { await this.updateCapabilityValue("alarm_contact", true); }
      if (device.data.status === "close") { await this.updateCapabilityValue("alarm_contact", false); }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiMagnetSensor;