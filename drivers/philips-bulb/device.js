"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');
const miio = require('miio');

class PhilipsBulbDevice extends Homey.Device {

  onInit() {
    this.createDevice();
    setTimeout(() => { this.refreshDevice(); }, 600000);

    this.setUnavailable(Homey.__('unreachable'));

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', (value, opts) => {
      if (this.miio) {
        return this.miio.setPower(value);
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });

    this.registerCapabilityListener('dim', (value, opts) => {
      if (this.miio) {
        var brightness = value * 100;
        return this.miio.setBrightness(brightness);
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });

    this.registerCapabilityListener('light_temperature', (value, opts) => {
      if (this.miio) {
        var colorvalue = util.denormalize(value, 3000, 5700);
        var colortemp = ''+ colorvalue +'K';
        return this.miio.color(colortemp);
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
    if (this.miio ) {
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

      this.miio.on('colorChanged', c => {
        var colortemp = util.normalize(c.values[0], 3000, 5700);
        if (this.getCapabilityValue('light_temperature') != colortemp) {
          this.setCapabilityValue('light_temperature', colortemp);
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
          const power = await this.miio.power();
          const brightness = await this.miio.brightness();

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

  refreshDevice(interval) {
    clearInterval(this.refreshInterval);

    this.refreshInterval = setInterval(() => {
      if (this.miio) {
        this.miio.destroy();
      }

      setTimeout(() => {
        this.createDevice();
      }, 2000);
    }, 3600000);
  }
}

module.exports = PhilipsBulbDevice;
