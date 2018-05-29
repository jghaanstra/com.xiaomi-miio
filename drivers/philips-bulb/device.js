'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');
const miio = require('miio');

class PhilipsBulbDevice extends Homey.Device {

  onInit() {
    this.createDevice();

    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
    this.registerCapabilityListener('light_temperature', this.onCapabilityLightTemperature.bind(this));
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
    this.miio.destroy();
  }

  // LISTENERS FOR UPDATING CAPABILITIES
  onCapabilityOnoff(value, opts, callback) {
    this.miio.setPower(value)
      .then(result => { callback(null, value) })
      .catch(error => { callback(error, false) });
  }

  onCapabilityDim(value, opts, callback) {
    var brightness = value * 100;
    this.miio.setBrightness(brightness)
      .then(result => { callback(null, value) })
      .catch(error => { callback(error, false) });
  }

  onCapabilityLightTemperature(value, opts, callback) {
    var colorvalue = util.denormalize(value, 3000, 5700);
    var colortemp = ''+ colorvalue +'K';
    this.miio.color(colortemp)
      .then(result => { callback(null, value) })
      .catch(error => { callback(error, false) });
  }

  // HELPER FUNCTIONS
  createDevice() {
    miio.device({
      address: this.getSetting('address'),
      token: this.getSetting('token')
    }).then(miiodevice => {
      this.miio = miiodevice;

      var interval = this.getSetting('polling') || 60;
      this.pollDevice(interval);
    }).catch(function (error) {
      this.log(error);
    });
  }

  pollDevice(interval) {
    clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(() => {
      const getData = async () => {
        try {
          const power = await this.miio.power();
          const brightness = await this.miio.brightness();
          const colorTemperature = await this.miio.color();

          if (this.getCapabilityValue('onoff') != power) {
            this.setCapabilityValue('onoff', power);
          }
          var dim = brightness / 100;
          if (this.getCapabilityValue('dim') != dim) {
            this.setCapabilityValue('dim', dim);
          }
          var colorvalue = colorTemperature.replace('K', '');
          var colortemp = util.normalize(colorvalue, 3000, 5700);
          if (this.getCapabilityValue('light_temperature') != colortemp) {
            this.setCapabilityValue('light_temperature', colortemp);
          }
          if (!this.getAvailable()) {
            this.setAvailable();
          }
        } catch (error) {
          this.setUnavailable(Homey.__('unreachable'));
          this.log(error);
        }
      }
      getData();
    }, 1000 * interval);
  }

}

module.exports = PhilipsBulbDevice;
