'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class SmokeSensorDevice extends Device {

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }
      
      const settings = this.getSettings();

      /* measure_battery & alarm_battery */
      if (device.data.voltage) {
        const battery = (device.data.voltage - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }

      /* alarm_tamper */
      if (device.data.alarm == "1") {
        await this.updateCapabilityValue("alarm_smoke", true);

        if (this.timeoutAlarm) { this.homey.clearTimeout(this.timeoutAlarm); }

        this.timeoutAlarm = setTimeout(async () => {
          await this.updateCapabilityValue("alarm_smoke", false);
        }, this.getSetting('alarm_duration_number') * 1000);

      }

      /* measure_some_density */
      if (device.data.density) { await this.updateCapabilityValue("measure_smoke_density", parseInt(device.data.density)); }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = SmokeSensorDevice;