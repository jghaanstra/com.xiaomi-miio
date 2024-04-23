'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/chuangmi.plug.v1
// https://home.miot-spec.com/spec/chuangmi.plug.v3

class MiSmartPlugWiFiWithUSBDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

      this.registerCapabilityListener('onoff.usb', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call(value ? "set_usb_on" : "set_usb_off", []);
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

      this.registerCapabilityListener('onoff.led', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_wifi_led", [value ? "on" : "off"]);
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
      const result = await this.miio.call("get_prop", ["power", "usb_on", "temperature", "wifi_led"]);
      if (!this.getAvailable()) { await this.setAvailable(); }
      
      await this.updateCapabilityValue("onoff", result[0] == "on" ? true : false);
      await this.updateCapabilityValue("onoff.usb", result[1]);
      await this.updateCapabilityValue("measure_temperature", result[2]);
      await this.updateCapabilityValue("onoff.led", result[3] == "on" ? true : false);

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

module.exports = MiSmartPlugWiFiWithUSBDevice;
