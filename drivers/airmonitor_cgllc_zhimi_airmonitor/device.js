'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.airmonitor.v1
// https://home.miot-spec.com/spec/cgllc.airmonitor.b1
// https://home.miot-spec.com/spec/cgllc.airmonitor.s1

class AirmonitorZhimiCgllcDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_power", [value ? 'on' : 'off'], { retries: 1 });
          } else {
            this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
            this.createDevice();
            return Promise.reject('Device unreachable, please try again ...');
          }
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

    } catch (error) {
      this.error(error);
    }
  }

  async retrieveDeviceData() {
    try {

      /* model specific capabilities */
      switch (this.getStoreValue('model')) {
        case 'cgllc.airmonitor.v1':
          await this.util.sleep(2000);
          const result_v1 = await this.miio.call("get_prop", ["power", "aqi", "battery"]);
          if (!this.getAvailable()) { await this.setAvailable(); }
          await this.updateCapabilityValue("onoff", result_v1[0]);
          await this.updateCapabilityValue("measure_pm25", result_v1[1]);
          await this.updateCapabilityValue("measure_battery", this.util.clamp(parseInt(result_v1[2]), 0 , 100));
          await this.updateCapabilityValue("alarm_battery", this.util.clamp(parseInt(result_v1[2]), 0 , 100) > 20 ? false : true);
          break;
        case 'cgllc.airmonitor.b1':
          await this.util.sleep(2000);
          const result = await this.miio.call("get_air_data", []);
          if (!this.getAvailable()) { await this.setAvailable(); }
          if (!this.hasCapability('measure_tvoc')) { await this.addCapability('measure_tvoc'); }
          await this.updateCapabilityValue("measure_pm25", parseInt(result.result.pm25));
          await this.updateCapabilityValue("measure_co2", parseInt(result.result.co2e));
          await this.updateCapabilityValue("measure_humidity", parseInt(result.result.humidity));
          await this.updateCapabilityValue("measure_temperature", parseInt(result.result.temperature));
          await this.updateCapabilityValue("measure_tvoc", parseInt(result.result.tvoc));
          break;
        case 'cgllc.airmonitor.s1':
          await this.util.sleep(2000);
          const result_s1 = await this.miio.call("get_prop", ["battery", "co2", "humidity", "pm25", "temperature", "tvoc"], { retries: 1 });
          if (!this.getAvailable()) { await this.setAvailable(); }
          if (!this.hasCapability('measure_tvoc')) { await this.addCapability('measure_tvoc'); }
          await this.updateCapabilityValue("measure_battery", this.util.clamp(parseInt(result_s1[0]), 0 , 100));
          await this.updateCapabilityValue("alarm_battery", this.util.clamp(parseInt(result_s1[0]), 0 , 100) > 20 ? false : true);
          await this.updateCapabilityValue("measure_co2", result_s1[1]);
          await this.updateCapabilityValue("measure_humidity", result_s1[2]);
          await this.updateCapabilityValue("measure_pm25", parseFloat(result_s1[3]));
          await this.updateCapabilityValue("measure_temperature", parseFloat(result_s1[4]));
          await this.updateCapabilityValue("measure_tvoc", parseInt(result_s1[5]));
          break;
        default:
          break;
      }

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

module.exports = AirmonitorZhimiCgllcDevice;
