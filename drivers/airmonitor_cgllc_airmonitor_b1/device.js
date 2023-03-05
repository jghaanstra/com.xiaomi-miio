'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiAirQualityMonitor2GenDevice extends Device {

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
      const result = await this.miio.call("get_air_data", []);
      if (!this.getAvailable()) { await this.setAvailable(); }
      await this.updateCapabilityValue("measure_pm25", parseInt(result.result.pm25));
      await this.updateCapabilityValue("measure_co2", parseInt(result.result.co2e));
      await this.updateCapabilityValue("measure_humidity", parseInt(result.result.humidity));
      await this.updateCapabilityValue("measure_temperature", parseInt(result.result.temperature));
      await this.updateCapabilityValue("measure_voc", parseInt(result.result.tvoc));

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

module.exports = MiAirQualityMonitor2GenDevice;
