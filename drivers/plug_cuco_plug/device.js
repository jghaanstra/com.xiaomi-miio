'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/cuco.plug.v2eur // Xiaomi Smart Plug 2

const mapping = {
  "cuco.plug.v2eur": "mapping_default",
  "cuco.plug.*": "mapping_default",
};

const properties = {
  "mapping_default": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "meter_power", siid: 11, piid: 1 }, // meter_power
      { did: "measure_power", siid: 11, piid: 2 }, // measure_power
      { did: "child_lock", siid: 7, piid: 1 }, // settings.childLock
      { did: "light", siid: 13, piid: 1 } // settings.led
    ],
    "set_properties": {
      "power": { siid: 2, piid: 1 },
      "child_lock": { siid: 7, piid: 1 },
      "light": { siid: 13, piid: 1 }
    }
  }
}

class CucoPlugDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['cuco.plug.*']];

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.power.siid, piid: this.deviceProperties.set_properties.power.piid, value: value }], { retries: 1 });
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

    if (changedKeys.includes("led")) {
      const led = await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.light.siid, piid: this.deviceProperties.set_properties.light.piid, value: newSettings.led ? 2 : 0 }], { retries: 1 });
    }

    if (changedKeys.includes("child_lock")) {
      const childlock = await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.child_lock.siid, piid: this.deviceProperties.set_properties.child_lock.piid, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_properties", this.deviceProperties.get_properties, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const onoff = result.find(obj => obj.did === 'power');
      const meter_power = result.find(obj => obj.did === 'meter_power');
      const measure_power = result.find(obj => obj.did === 'measure_power');
      const child_lock = result.find(obj => obj.did === 'child_lock');
      const led = result.find(obj => obj.did === 'light');

      /* capabilities */
      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("meter_power", meter_power.value / 1000);
      await this.updateCapabilityValue("measure_power", measure_power.value);

      /* settings */
      await this.updateSettingValue("led", led.value);
      await this.updateSettingValue("childLock", child_lock.value); 

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

module.exports = CucoPlugDevice;
