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
      this.registerCapabilityListener("onoff", this.onCapabilityOnoffVacuumcleaner.bind(this));
      this.registerCapabilityListener("vacuumcleaner_state", this.onCapabilityVacuumcleanerState.bind(this));

    } catch (error) {
      this.error(error);
    }
  }

  async retrieveDeviceData() {
    try {
      var battery = this.miio.getState('batteryLevel');
      var fanspeed = this.miio.getState('fanSpeed');

      if (this.miio.property('state') == 'charging' && battery !== 100) {
        var onoff = false;
        var state = 'charging';
      } else if (this.miio.property('state') == 'docking' || this.miio.property('state') == 'full' || this.miio.property('state') == 'returning' || this.miio.property('state') == 'waiting' || this.miio.property('state') == 'charging') {
        var onoff = false;
        var state = 'docked';
      } else if (this.miio.property('state') == 'cleaning' || this.miio.property('state') == 'zone-cleaning') {
        var onoff = true;
        var state = 'cleaning';
      } else if (this.miio.property('state') == 'spot-cleaning') {
        var onoff = true;
        var state = 'spot_cleaning';
      } else {
        var onoff = false;
        var state = 'stopped';
      }

      if (this.getCapabilityValue('onoff') != onoff) {
        this.setCapabilityValue('onoff', onoff);
      }
      if (this.getCapabilityValue('measure_battery') != battery) {
        this.setCapabilityValue('measure_battery', this.util.clamp(battery, 0, 100));
      }
      if (this.getStoreValue('fanspeed') != fanspeed) {
        this.setStoreValue('fanspeed', fanspeed);
      }

      if (this.getCapabilityValue('vacuumcleaner_state') !== state) {
        await this.setCapabilityValue('vacuumcleaner_state', state);
        await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": this.miio.property('state')}).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiRobotDevice;
