'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/hyd.airer.znlyj4


const mapping = {
  "hyd.airer.znlyj4": "mapping_default",
  "hyd.airer.*": "mapping_default",
};

const properties = {
  "mapping_default": {
    "get_properties": [
      { did: "fault", siid : 2, piid: 1 }, // settings.error
      { did: "controls", siid : 2, piid: 2 }, // windowcoverings_state
      { did: "position", siid : 2, piid: 3 }, // not in use
      { did: "movement", siid : 2, piid: 3 }, // windowcoverings_state
      { did: "light", siid: 3, piid: 1 }, // onoff
    ],
    "set_properties": {
      "light": { siid: 3, aiid: 1, did: "call-3-1", in: [] }
    }
  }
}

class ClothesDryerHydAirerMiotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['hyd.airer.*']];

      this.errorCodes = {
        0: "No Error",
        1: "Obstruction",
        2: "Overweight",
        3: "Overheated"
      }

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("action", this.deviceProperties.set_properties.light, { retries: 1 });
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

      this.registerCapabilityListener('windowcoverings_state', async (value) => {
        try {
          if (this.miio) {
            switch (value) {
              case 'idle':
                return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.controls.siid, piid: this.deviceProperties.set_properties.controls.piid, value: 0 }], { retries: 1 });
              case 'up':
                return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.controls.siid, piid: this.deviceProperties.set_properties.controls.piid, value: 1 }], { retries: 1 });
              case 'down':
                return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.controls.siid, piid: this.deviceProperties.set_properties.controls.piid, value: 2 }], { retries: 1 });
              default:
                return Promise.reject('State not recognized ...');
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

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys.includes("address") || changedKeys.includes("token") || changedKeys.includes("polling")) {
      this.refreshDevice();
    }
    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_properties", this.deviceProperties.get_properties, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const light = result.find(obj => obj.did === 'light');
      const movement = result.find(obj => obj.did === 'movement');
      const fault = result.find(obj => obj.did === 'fault');

      /* capabilities */
      if (light !== undefined) {
        await this.updateCapabilityValue("onoff", light.value);
      }

      if (movement !== undefined) {
        switch (movement.value) {
          case 0:
          case 3:
            await this.updateCapabilityValue("windowcoverings_state", "idle");
          case 1:
            await this.updateCapabilityValue("windowcoverings_state", "up");
          case 2:
            await this.updateCapabilityValue("windowcoverings_state", "down");
          default:
            this.error('State not recognized ...');
        }
      }

      /* settings */
      const error = this.errorCodes[fault.value];
      await this.updateSettingValue("error", error);

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

module.exports = ClothesDryerHydAirerMiotDevice;
