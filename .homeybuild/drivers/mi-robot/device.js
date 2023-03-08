'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiRobotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('statusVacuum');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            if (value) {
              await this.miio.clean();
              return await this.setCapabilityValue('vacuumcleaner_state', 'cleaning');
            } else {
              await this.miio.stop();
              return this.setCapabilityValue('vacuumcleaner_state', 'stopped');
            }
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

      this.registerCapabilityListener('vacuumcleaner_state', async ( value ) => {
        try {
          if (this.miio) {
            switch (value) {
              case "cleaning":
                await this.miio.activateCleaning();
                return await this.setCapabilityValue('onoff', true);
              case "spot_cleaning":
                await this.miio.activateSpotClean();
                return await this.setCapabilityValue('onoff', true);
              case "stopped":
                await this.miio.pause();
                return await this.setCapabilityValue('onoff', false);
              case "docked":
              case "charging":
                await this.miio.pause();
                await this.miio.activateCharging();
                return await this.setCapabilityValue('onoff', false);
              default:
                this.error("Not a valid vacuumcleaner_state");
            }
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

module.exports = MiRobotDevice;
