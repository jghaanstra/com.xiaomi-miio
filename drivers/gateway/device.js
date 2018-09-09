'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');
const miio = require('miio');
const tinycolor = require("tinycolor2");

class GatewayDevice extends Homey.Device {

  onInit() {
    new Homey.FlowCardTriggerDevice('gatewayLuminance').register();

    this.createDevice();

    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
    this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], this.onCapabilityHueSaturation.bind(this), 500);
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
    this.miio.destroy();
  }

  // LISTENERS FOR UPDATING CAPABILITIES
  onCapabilityOnoff(value, opts, callback) {
    this.miio.light.setPower(value)
      .then(result => { callback(null, value) })
      .catch(error => { callback(error, false) });
  }

  onCapabilityDim(value, opts, callback) {
    var brightness = value * 100;
    this.miio.light.setBrightness(brightness)
      .then(result => { callback(null, value) })
      .catch(error => { callback(error, false) });
  }

  onCapabilityHueSaturation(valueObj, optsObj) {
    if (typeof valueObj.light_hue !== 'undefined') {
      var hue_value = valueObj.light_hue;
    } else {
      var hue_value = this.getCapabilityValue('light_hue');
    }

    if (typeof valueObj.light_saturation !== 'undefined') {
      var saturation_value = valueObj.light_saturation;
    } else {
      var saturation_value = this.getCapabilityValue('light_saturation');
    }

    var hue = hue_value * 359;
    var saturation = saturation_value * 100;
    var dim = this.getCapabilityValue('dim') * 100
    var colorUpdate = tinycolor({ h: Math.round(hue), s: Math.round(saturation), v: dim });
    this.miio.light.color(colorUpdate.toRgbString())

    return Promise.resolve();
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
          Homey.ManagerFlow.getCard('trigger', 'gatewayLuminance').trigger(this, {luminance: illuminance.value}, {})
        }
      });

      this.miio.light.on('colorChanged', c => {
        var colorChanged = tinycolor({r: c.rgb.red, g: c.rgb.green, b: c.rgb.blue});
        var hsv = colorChanged.toHsv();
        var hue = Math.round(hsv.h) / 359;
        var saturation = Math.round(hsv.s);

        if (this.getCapabilityValue('light_hue') != hue) {
          this.setCapabilityValue('light_hue', hue);
        }

        if (this.getCapabilityValue('light_saturation') != saturation) {
          this.setCapabilityValue('light_saturation', saturation);
        }
      });

      var interval = this.getSetting('polling') || 60;
      this.pollDevice(interval);
    }).catch((error) => {
      this.log(error);
      this.setUnavailable(Homey.__('unreachable'));
      setTimeout(() => {
        this.createDevice();
      }, 10000);
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
          var dim = brightness / 100;
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
}

module.exports = GatewayDevice;
