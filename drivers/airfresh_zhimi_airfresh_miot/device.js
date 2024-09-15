'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.airfresh.ua1

// [{'did': 'prop.2.1', 'siid': 2, 'piid': 1, 'code': 0, 'value': False}, {'did': 'prop.2.5', 'siid': 2, 'piid': 5, 'code': 0, 'value': 1}, {'did': 'prop.2.6', 'siid': 2, 'piid': 6, 'code': 0, 'value': False}, {'did': 'prop.5.1', 'siid': 5, 'piid': 1, 'code': 0, 'value': False}, {'did': 'prop.6.1', 'siid': 6, 'piid': 1, 'code': 0, 'value': True}, {'did': 'prop.7.3', 'siid': 7, 'piid': 3, 'code': 0, 'value': 0}]

const mapping = {
  "zhimi.airfresh.ua1": "properties_default",
  "zhimi.airfresh.*": "properties_default",
};

const properties = {
  "properties_default": {
    "get_properties": [
      { did: "onoff", siid: 2, piid: 1 }, // onoff
      { did: "heat", siid: 2, piid: 6 }, // onoff.ptc
      { did: "fanlevel", siid: 2, piid: 5 }, // airpurifier_zhimi_fanlevel
      { did: "fault", siid : 2, piid: 2 }, // settings.error
      { did: "buzzer", siid : 6, piid: 1 }, // settings.buzzer
      { did: "led", siid : 7, piid: 3 }, // settings.buzzer
      { did: "childLock", siid : 5, piid: 1 }, // settings.childLock
      { did: "f1_hour_used", siid : 4, piid: 1 }, // settings.f1_hour_used
    ]
  }
}

class MiAirFreshMiotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['zhimi.airfresh.*']];

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 1, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('onoff.ptc', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 6, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('airpurifier_zhimi_fanlevel', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 5, value: +value }], { retries: 1 });
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
      const led = await this.miio.call("set_properties", [{ siid: 7, piid: 3, value: newSettings.led === 0 ? false : true }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_properties", [{ siid: 6, piid: 1, value: newSettings.buzzer }], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_properties", [{ siid: 5, piid: 1, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_properties", this.deviceProperties.get_properties, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const onoff = result.find(obj => obj.did === 'onoff');
      const onoff_ptc = result.find(obj => obj.did === 'heat');
      const fanlevel = result.find(obj => obj.did === 'fanlevel');

      const fault = result.find(obj => obj.did === 'fault');
      const buzzer = result.find(obj => obj.did === 'buzzer');
      const led = result.find(obj => obj.did === 'led');
      const childLock = result.find(obj => obj.did === 'childLock');
      const f1_hour_used = result.find(obj => obj.did === 'f1_hour_used');

      /* capabilities */
      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("onoff.ptc",  onoff_ptc.value);
      await this.updateCapabilityValue("airpurifier_zhimi_fanlevel", fanlevel.value.toString());

      /* settings */
      await this.updateSettingValue("buzzer", buzzer.value);
      await this.updateSettingValue("led", led.value === 0 ? false : true);
      await this.updateSettingValue("childLock", childLock.value);
      await this.updateSettingValue("f1_hour_used", Math.round(f1_hour_used.value / 60) + " hours used");

      const error = fault.value === 0 ? 'No error' : fault.value;
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

module.exports = MiAirFreshMiotDevice;