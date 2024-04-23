'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');
const tinycolor = require("tinycolor2");

/* supported devices */
// https://home.miot-spec.com/spec/philips.light.strip5 // Xiaomi Smart Lightstrip Pro

const mapping = {
  "philips.light.strip5": "mapping_default",
  "philips.light.*": "mapping_default",
};

const properties = {
  "mapping_default": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "mode", siid: 2, piid: 2 }, // ?
      { did: "brightness", siid: 2, piid: 3 }, // dim
      { did: "color", siid: 3, piid: 4 }, // light_hue, light_saturation
    ],
    "set_properties": {
      "power": { siid: 2, piid: 1 },
      "mode": { siid: 2, piid: 2 },
      "brightness": { siid: 2, piid: 3 },
      "color":  { siid: 2, piid: 4 }
    }
  }
}

class PhilipsLightStripDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['philips.light.*']];

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.power.siid, piid: this.deviceProperties.set_properties.power.piid, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.miio) {
            const brightness = value * 100;
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.brightness.siid, piid: this.deviceProperties.set_properties.brightness.piid, value: brightness }], { retries: 1 });
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

      this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], async (valueObj) => {
        try {
          if (this.miio) {
            const hue_value = typeof valueObj.light_hue !== 'undefined' ? valueObj.light_hue : this.getCapabilityValue('light_hue');
            const saturation_value = typeof valueObj.light_saturation !== 'undefined' ? valueObj.light_saturation : this.getCapabilityValue('light_saturation');
            const color = tinycolor({h: hue_value, s: saturation_value, v: 1 });
            const rgbValue = color.toHex();
            const intValue = parseInt(rgbValue.substring(1), 16);
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.color.siid, piid: this.deviceProperties.set_properties.color.piid, value: intValue }], { retries: 1 });
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
      const result = await this.miio.call("get_properties", this.deviceProperties.get_properties, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const onoff = result.find(obj => obj.did === 'power');
      const brightness = result.find(obj => obj.did === 'brightness');
      const color = result.find(obj => obj.did === 'color');

      /* capabilities */
      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("dim", brightness.value / 100);

      const hexValue = color.value.toString(16).padStart(6, '0');
      const colorvalue = tinycolor(`#${hexValue}`);

      await this.updateCapabilityValue("light_hue", colorvalue.toHsv().h);
      await this.updateCapabilityValue("light_saturation", colorvalue.toHsv().s);

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

module.exports = PhilipsLightStripDevice;
