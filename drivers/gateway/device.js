"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');
const miio = require('miio');
const tinycolor = require('tinycolor2');

class GatewayDevice extends Homey.Device {

  onInit() {
    this.gatewayLuminanceTrigger = new Homey.FlowCardTriggerDevice('gatewayLuminance').register();

    this.createDevice();
    setTimeout(() => { this.refreshDevice(); }, 600000);

    this.setUnavailable(Homey.__('unreachable'));

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', (value, opts) => {
      if (this.miio) {
        return this.miio.light.setPower(value);
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });

    this.registerCapabilityListener('dim', (value, opts) => {
      if (this.miio) {
        const brightness = value * 100;
        return this.miio.light.setBrightness(brightness);
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });

    this.registerMultipleCapabilityListener(['light_hue', 'light_saturation' ], ( valueObj, optsObj ) => {
      if (this.miio) {
        if (valueObj.hasOwnProperty('light_hue')) {
          var hue_value = valueObj.light_hue;
        } else {
          var hue_value = this.getCapabilityValue('light_hue');
        }

        if (valueObj.hasOwnProperty('light_saturation')) {
          var saturation_value = valueObj.light_saturation;
        } else {
          var saturation_value = this.getCapabilityValue('light_saturation');
        }

        const hue = hue_value * 359;
        const saturation = saturation_value * 100;
        const dim = this.getCapabilityValue('dim') * 100
        const colorUpdate = tinycolor({ h: Math.round(hue), s: Math.round(saturation), v: dim });

        return this.miio.light.color(colorUpdate.toRgbString());
      } else {
         this.setUnavailable(Homey.__('unreachable'));
         this.createDevice();
         return Promise.reject('Device unreachable, please try again ...');
      }
    }, 500);

    this.registerCapabilityListener('homealarm_state', (value, opts) => {
      if (this.miio) {
        const state = value == 'armed' ? true : false;
        return this.miio.setArming(state);
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
    clearInterval(this.refreshInterval);
    if (this.miio) {
      this.miio.destroy();
    }
  }

  // HELPER FUNCTIONS
  createDevice() {
    miio.device({
      address: this.getSetting('address'),
      token: this.getSetting('token')
    }).then(miiodevice => {
      if (!this.getAvailable()) {
        this.setAvailable();
      }
      this.miio = miiodevice;
      this.miio.light = miiodevice.child('light');

      this.miio.on('illuminanceChanged', illuminance => {
        if (this.getCapabilityValue('measure_luminance') != illuminance.value) {
          this.setCapabilityValue('measure_luminance', illuminance.value);
          this.gatewayLuminanceTrigger.trigger(this, {luminance: illuminance.value})
        }
      });

      this.miio.light.on('colorChanged', c => {
        const colorChanged = tinycolor({r: c.rgb.red, g: c.rgb.green, b: c.rgb.blue});
        const hsv = colorChanged.toHsv();
        const hue = Math.round(hsv.h) / 359;
        const saturation = Math.round(hsv.s);

        if (this.getCapabilityValue('light_hue') !== hue) {
          this.setCapabilityValue('light_hue', hue);
        }

        if (this.getCapabilityValue('light_saturation') !== saturation) {
          this.setCapabilityValue('light_saturation', saturation);
        }
      });

      const interval = this.getSetting('polling') || 60;
      this.pollDevice(interval);
    }).catch(error => {
      this.error(error);
      this.setUnavailable(Homey.__('unreachable'));
      setTimeout(() => {
        this.createDevice();
      }, 10 * 1000);
    });
  }

  pollDevice(interval) {
    clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(() => {
      const getData = async () => {
        try {
          const power = await this.miio.light.power();
          const brightness = await this.miio.light.brightness();

          if (this.getCapabilityValue('onoff') != power) {
            this.setCapabilityValue('onoff', power);
          }
          const dim = brightness / 100;
          if (this.getCapabilityValue('dim') != dim) {
            this.setCapabilityValue('dim', dim);
          }
          if (!this.getAvailable()) {
            this.setAvailable();
          }
        } catch (error) {
          this.log(error);
          clearInterval(this.pollingInterval);
          this.setUnavailable(Homey.__('unreachable'));
          setTimeout(() => {
            this.createDevice();
          }, 1000 * interval);
        }
      }
      getData();
    }, 1000 * interval);
  }

  refreshDevice(interval) {
    clearInterval(this.refreshInterval);

    this.refreshInterval = setInterval(() => {
      this.miio.destroy();

      setTimeout(() => {
        this.createDevice();
      }, 2000);
    }, 300000);
  }
}

module.exports = GatewayDevice;
