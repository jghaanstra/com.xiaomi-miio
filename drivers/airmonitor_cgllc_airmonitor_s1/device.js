'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiClearGlassAirDetectorDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

    } catch (error) {
      this.error(error);
    }
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_prop", ["battery", "battery_state", "co2", "humidity", "pm25", "temperature", "tvoc"]);
      if (!this.getAvailable()) { await this.setAvailable(); }
      await this.updateCapabilityValue("measure_pm25", parseInt(result.pm25));
      await this.updateCapabilityValue("measure_co2", parseInt(result.co2));
      await this.updateCapabilityValue("measure_humidity", parseFloat(result.humidity));
      await this.updateCapabilityValue("measure_temperature", parseFloat(result.temperature));
      await this.updateCapabilityValue("measure_tvoc", parseInt(result.tvoc));
      await this.updateCapabilityValue("measure_battery", this.util.clamp(parseInt(result.battery), 0 , 100));
      await this.updateCapabilityValue("alarm_battery", this.util.clamp(parseInt(result.battery), 0 , 100) > 20 ? false : true);

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error.message);
    }
  }

}

module.exports = MiClearGlassAirDetectorDevice;
