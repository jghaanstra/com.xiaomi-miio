'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraWireless86SW1SwitchDevice extends Device {

  async onEventFromGateway(device) {
    try {
      
      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }
  
      /* button events */
      if (device && device.data && device.data["channel_0"] == "click") { await this.homey.flow.getDeviceTriggerCard('click_single').trigger(this).catch(error => { this.error(error) }); }

    } catch (error) {
      this.error(error);
    }    
  }

}

module.exports = AqaraWireless86SW1SwitchDevice;