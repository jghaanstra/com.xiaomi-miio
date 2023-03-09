'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraWleakSensor extends Device {

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }
  
      /* alarm_water */
      if (device && device.data && device.data["status"] == "leak") { await this.updateCapabilityValue("alarm_water", true); }
      if (device && device.data && device.data["status"] == "no_leak") { await this.updateCapabilityValue("alarm_water", false); }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = AqaraWleakSensor;