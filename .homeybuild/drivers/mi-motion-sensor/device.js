'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class MiMotionSensor extends Device {

  async onEventFromGateway(device) {
    try {
      const settings = this.getSettings();

      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }

      /* alarm_motion */
      if (device && device.data && device.data["status"] == "motion") {
        await this.updateCapabilityValue("alarm_motion", true);
        if (this.timeout) { this.homey.clearTimeout(this.timeoutMotion); }
        this.timeoutMotion = setTimeout(async () => {
          await this.updateCapabilityValue("alarm_motion", false);
        }, settings.alarm_duration_number * 1000);
      }
      if (device && device.data && device.data["no_motion"]) {
        await this.updateCapabilityValue("alarm_motion", false);
        await this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion'+ device.data["no_motion"]).trigger(this).catch(error => { this.error(error) });
      }

      /* measure_luminance */
      if (device && device.data && device.data["lux"]) { await this.updateCapabilityValue("measure_luminance", parseInt(device.data["lux"])); }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiMotionSensor;