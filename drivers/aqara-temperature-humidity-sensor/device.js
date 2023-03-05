'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraTemperatureHumiditySensor extends Device {

  async onEventFromGateway(device) {
    try {
      const settings = this.getSettings();

      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }
  
     /* measure_humidity */
     if (device && device.data && device.data["humidity"]) { await this.updateCapabilityValue("measure_humidity", parseFloat(parseFloat(device.data["humidity"] / 100).toFixed(1))); }

     /* measure_temperature */
      if (device && device.data && device.data["temperature"]) {
        if (settings.addOrTakeOffset == "add") {
          await this.updateCapabilityValue("measure_temperature", parseFloat(parseFloat(device.data["temperature"] / 100 + parseFloat(settings.offset)).toFixed(1)));
        } else if (settings.addOrTakeOffset == "take") {
          await this.updateCapabilityValue("measure_temperature", parseFloat(parseFloat(device.data["temperature"] / 100 - parseFloat(settings.offset)).toFixed(1)));
        }
      }

      /* measure_pressure */
      if (device && device.data && device.data["pressure"]) { await this.updateCapabilityValue("measure_pressure", parseFloat(parseFloat(device.data["pressure"] / 100).toFixed(1))); }

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = AqaraTemperatureHumiditySensor;