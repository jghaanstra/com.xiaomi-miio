'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class VibrationSensorDevice extends Device {

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }

      /* alarm_tamper */
      if (device && device.data && device["data"]["status"] == "vibrate") {
        await this.updateCapabilityValue("alarm_tamper", true);

        if (this.timeoutAlarmTamper) { this.homey.clearTimeout(this.timeoutAlarmTamper); }

        this.timeoutAlarmTamper = setTimeout(async () => {
          await this.updateCapabilityValue("alarm_tamper", false);
        }, this.getSetting('alarm_duration_number') * 1000);
      }

      /* alarm_motion.tilt */
      if (device && device.data && device["data"]["status"] == "tilt") {
        await this.updateCapabilityValue("alarm_motion.tilt", true);
        await this.homey.flow.getDeviceTriggerCard('triggerVibrationTiltAlarm').trigger(this).catch(error => { this.error(error) });

        if (this.timeoutAlarmTilt) { this.homey.clearTimeout(this.timeoutAlarmTilt); }

        this.timeoutAlarmTilt = setTimeout(async () => {
          await this.updateCapabilityValue("alarm_motion.tilt", false);
        }, this.getSetting('alarm_duration_number') * 1000);
      }
  
      /* alarm_motion.freefall */
      if (device && device.data && device["data"]["status"] == "free_fall") {
        await this.updateCapabilityValue("alarm_motion.freefall", true);
        await this.homey.flow.getDeviceTriggerCard('triggerVibrationFreeFallAlarm').trigger(this).catch(error => { this.error(error) });

        if (this.timeoutAlarmFall) { this.homey.clearTimeout(this.timeoutAlarmFall); }

        this.timeoutAlarmFall = setTimeout(async () => {
          await this.updateCapabilityValue("alarm_motion.freefall", false);
        }, this.getSetting('alarm_duration_number') * 1000);
      }
  
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = VibrationSensorDevice;