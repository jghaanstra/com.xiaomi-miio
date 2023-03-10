'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class NatSensorDevice extends Device {

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* measure_battery & alarm_battery */
      if (device.data.voltage) {
        const battery = (device.data.voltage - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }

      /* alarm_co */
      if (device.data.alarm == "1") {
        await this.updateCapabilityValue("alarm_co", true);

        if (this.timeoutAlarm) { this.homey.clearTimeout(this.timeoutAlarm); }

        this.timeoutAlarm = setTimeout(async () => {
          await this.updateCapabilityValue("alarm_co", false);
        }, this.getSetting('alarm_duration_number') * 1000);
        
      }

      /* measure_gas_density */
      if (device.data.density) { await this.updateCapabilityValue("measure_gas_density", parseInt(device.data.density)); }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = NatSensorDevice;