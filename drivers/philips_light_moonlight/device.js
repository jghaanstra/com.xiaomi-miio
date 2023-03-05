'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../lib/util.js');

class PhilipsBedsideLampDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));
      this.registerCapabilityListener("dim", this.onCapabilityDim.bind(this));

      this.registerCapabilityListener('light_temperature', (value) => {
        try {
          if (this.miio) {
            const color_temp = this.util.denormalize(value, 1700, 6500);
            return this.miio.call("set_ct_abx", [color_temp, "smooth", 500], { retries: 1 });
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

      this.registerCapabilityListener('light_hue', (value) => {
        try {
          if (this.miio) {
            let rgbToSend = this.hsb2rgb([value * 359, 1, 1]);
            let argbToSend = rgbToSend[0] * 65536 + rgbToSend[1] * 256 + rgbToSend[2];
            return this.miio.call("set_rgb", [argbToSend], { retries: 1 });
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

      const result = await this.miio.call("get_prop", ["pow", "bright", "rgb", "cct"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0] === "on" ? true : false);
      await this.updateCapabilityValue("dim", result[1] / 100);

      this.brightness = result[1] / 100;
      this.drgb = result[2];
      this.colorTemperature = result[3];

      if (this.drgb != undefined && this.drgb != null) {
        let red = (this.drgb >> 16) & 0xff;
        let green = (this.drgb >> 8) & 0xff;
        let blue = this.drgb & 0xff;
        let hsbc = this.rgb2hsb([red, green, blue]);
        const hue = hsbc[0] / 359;

        await this.updateCapabilityValue("light_hue", hue);
        await this.updateCapabilityValue("light_saturation", this.brightness);
      }

      if (this.colorTemperature != undefined && this.colorTemperature != null) {
        var colorTemp = this.util.normalize(this.colorTemperature, 1700, 6500);

        await this.updateCapabilityValue("light_temperature", colorTemp);
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

  hsb2rgb(hsb) {
    let rgb = [];
    for (let offset = 240, i = 0; i < 3; i++, offset -= 120) {
      let x = Math.abs(((hsb[0] + offset) % 360) - 240);
      if (x <= 60) rgb[i] = 255;
      else if (60 < x && x < 120) rgb[i] = (1 - (x - 60) / 60) * 255;
      else rgb[i] = 0;
    }
    for (let i = 0; i < 3; i++) rgb[i] += (255 - rgb[i]) * (1 - hsb[1]);
    for (let i = 0; i < 3; i++) rgb[i] *= hsb[2];
    for (let i = 0; i < 3; i++) rgb[i] = Math.round(rgb[i]);
    return rgb;
  }

  rgb2hsb(rgb) {
    var hsb = [];
    var rearranged = rgb.slice(0);
    var maxIndex = 0,
      minIndex = 0;
    var tmp;
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 2 - i; j++)
        if (rearranged[j] > rearranged[j + 1]) {
          tmp = rearranged[j + 1];
          rearranged[j + 1] = rearranged[j];
          rearranged[j] = tmp;
        }
    }
    for (var i = 0; i < 3; i++) {
      if (rearranged[0] == rgb[i]) minIndex = i;
      if (rearranged[2] == rgb[i]) maxIndex = i;
    }
    hsb[2] = rearranged[2] / 255.0;
    hsb[1] = 1 - rearranged[0] / rearranged[2];
    hsb[0] = maxIndex * 120 + 60 * (rearranged[1] / hsb[1] / rearranged[2] + (1 - 1 / hsb[1])) * ((maxIndex - minIndex + 3) % 3 == 1 ? 1 : -1);
    hsb[0] = (hsb[0] + 360) % 360;
    return hsb;
  }

}

module.exports = PhilipsBedsideLampDevice;
