'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraButton extends Device {

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }
  
      /* button events */
      if (device && device.data && device.data["status"] === "click") { await this.homey.flow.getDeviceTriggerCard('click_single').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "double_click") { await this.homey.flow.getDeviceTriggerCard('click_double').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "long_click_press") { await this.homey.flow.getDeviceTriggerCard('click_long').trigger(this).catch(error => { this.error(error) }); }
  
    } catch (error) {
      this.error(error);
    }
  }
  
}

module.exports = AqaraButton;