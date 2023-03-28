'use strict';

const Homey = require('homey');
const Util = require('../lib/util.js');

class MiSubDeviceDevice extends Homey.Device {

  async onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.initialize = this.initialize.bind(this);
    this.onEventFromGateway = this.onEventFromGateway.bind(this);
    this.data = this.getData();
    this.initialize();
    this.log("Sub Device Init: " + this.getName() + " with capabilities: " + this.getCapabilities().toString() + " and model " + this.getSetting('model'));
  }

  async onDeleted() {
    try {
      this.unregisterStateChangeListener();
      this.unregisterAuthChangeListener();
    } catch (error) {
      this.error(error);
    }
  }

  async onUninit() {
    try {
      this.unregisterStateChangeListener();
      this.unregisterAuthChangeListener();
    } catch (error) {
      this.error(error);
    }
  }

  // HELPER FUNCTIONS

  /* initialize the device */
  async initialize() {
    if (this.homey.app.mihub.hubs) {
      this.registerCapabilities();
      this.registerStateChangeListener();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  /* placeholder for registering capabilities, device specific */
  registerCapabilities() { }

  /* register events listener from gateway */
  registerStateChangeListener() {
    this.homey.app.mihub.on(this.data.sid, this.onEventFromGateway);
  }

  /* unregister events listener from gateway */
  unregisterStateChangeListener() {
    this.homey.app.mihub.removeListener(this.data.sid, this.onEventFromGateway);
  }

  /* unregister from gatewaysList events */
  unregisterAuthChangeListener() {
    this.homey.app.mihub.removeListener("gatewaysList", this.initialize);
  }

  /* update capabilities */
  async updateCapabilityValue(capability, value) {
    try {
      if (this.hasCapability(capability)) {
        if (value !== this.getCapabilityValue(capability) && value !== null && value !== 'null' && value !== 'undefined' && value !== undefined) {
          await this.setCapabilityValue(capability, value);
        }
      } else {
        this.log('adding capability '+ capability +' to '+ this.getName() +' with model '+ this.getSettings('model') +' as the device seems to have values for this capability ...');
            await this.addCapability(capability);
            await this.setCapabilityValue(capability, value);
        }
    } catch (error) {
      this.error('Trying to update or add capability', capability, 'with value', value, 'for device', this.getName(), 'with device id', this.getData().sid);
      this.error(error);
    }
  }

}

module.exports = MiSubDeviceDevice;