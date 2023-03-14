'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiHumidifier2Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});

      // TODO: remove this on the next official release
      if (this.hasCapability('measure_power')) { this.removeCapability('measure_power'); }
      if (!this.hasCapability('humidifier2_mode')) { this.addCapability('humidifier2_mode'); }
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel');
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

      this.registerCapabilityListener('humidifier2_mode', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.setMode(value);
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

}

module.exports = MiHumidifier2Device;
