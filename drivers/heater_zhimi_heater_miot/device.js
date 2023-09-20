'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.heater.mc2
// https://home.miot-spec.com/spec/zhimi.heater.za2
// https://home.miot-spec.com/spec/leshow.heater.bs1s
// https://home.miot-spec.com/spec/zhimi.heater.nb1

const mapping = {
  "zhimi.heater.mc2": "properties_mc2",
  "zhimi.heater.za2": "properties_za2",
	"leshow.heater.bs1s": "properties_bs1s",
	"zhimi.heater.nb1": "properties_nb1",
  "zhimi.heater.*": "properties_mc2"
};

const properties = {
  "properties_mc2": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "target_temperature", siid: 2, piid: 5 }, // heater_zhimi_heater_target_temperature
      { did: "temperature", siid: 4, piid: 7 }, // measure_temperature
      { did: "light", siid: 7, piid: 3 }, // settings.led
      { did: "buzzer", siid: 6, piid: 1 }, // settings.buzzer
      { did: "child_lock", siid: 5, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "onoff": { siid: 2, piid: 1 },
      "target_temperature": { siid: 2, piid: 5 },
      "light": {siid: 7, piid: 3 },
      "buzzer": {siid: 6, piid: 1 },
      "child_lock": {siid: 5, piid: 1 }
    }
  },
  "properties_za2": {
    "get_properties": [
      { did: "power", siid: 2, piid: 2 }, // onoff
      { did: "target_temperature", siid: 2, piid: 6 }, // heater_zhimi_heater_target_temperature
      { did: "temperature", siid: 5, piid: 8 }, // measure_temperature
      { did: "humidity", siid: 5, piid: 7 }, // measure_humidity
      { did: "light", siid: 6, piid: 1 }, // settings.led
      { did: "buzzer", siid: 3, piid: 1 }, // settings.buzzer
      { did: "child_lock", siid: 7, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "onoff": { siid: 2, piid: 1 },
      "target_temperature": { siid: 2, piid: 6 },
      "light": {siid: 6, piid: 3 },
      "buzzer": {siid: 3, piid: 1 },
      "child_lock": {siid: 7, piid: 1 }
    }
  },
  "properties_bs1s": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "target_temperature", siid: 2, piid: 3 }, // heater_zhimi_heater_target_temperature
      { did: "temperature", siid: 4, piid: 7 }, // measure_temperature
      { did: "light", siid: 7, piid: 1 }, // settings.led
      { did: "buzzer", siid: 5, piid: 1 }, // settings.buzzer
      { did: "child_lock", siid: 6, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "onoff": { siid: 2, piid: 1 },
      "target_temperature": { siid: 2, piid: 3 },
      "light": {siid: 7, piid: 7 },
      "buzzer": {siid: 5, piid: 1 },
      "child_lock": {siid: 6, piid: 1 }
    }
  },
  "properties_nb1": {
    "get_properties": [
      { did: "power", siid: 2, piid: 2 }, // onoff
      { did: "target_temperature", siid: 2, piid: 5 }, // heater_zhimi_heater_target_temperature
      { did: "temperature", siid: 9, piid: 7 }, // measure_temperature
      { did: "light", siid: 6, piid: 1 }, // settings.led
      { did: "buzzer", siid: 3, piid: 1 }, // settings.buzzer
      { did: "child_lock", siid: 7, piid: 1 }, // settings.childLock
      { did: "heater_zhimi_heatlevel", siid: 2, piid: 3 }, // heater_zhimi_heatlevel
      { did: "heater_zhimi_oscillation", siid: 2, piid: 4 } // heater_zhimi_oscillation
    ],
    "set_properties": {
      "onoff": { siid: 2, piid: 2 },
      "target_temperature": { siid: 2, piid: 5 },
      "light": {siid: 6, piid: 1 },
      "buzzer": {siid: 3, piid: 1 },
      "child_lock": {siid: 7, piid: 1 },
      "heater_zhimi_heatlevel": { siid: 2, piid: 3 },
      "heater_zhimi_oscillation": { siid: 2, piid: 4 }
    }
  }
}

class ZhimiHeaterMiotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // ADD DEVICES DEPENDANT CAPABILITIES
      if (this.getStoreValue('model') === 'zhimi.heater.za2') {
        if (!this.hasCapability('measure_humidity')) {
          this.addCapability('measure_humidity');
        }
      }

      if (this.getStoreValue('model') === 'zhimi.heater.nb1') {
        if (!this.hasCapability('heater_zhimi_heatlevel')) {
          this.addCapability('heater_zhimi_heatlevel');
        }
        if (!this.hasCapability('heater_zhimi_oscillation')) {
          this.addCapability('heater_zhimi_oscillation');
        }
      }

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['zhimi.heater.*']];

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "onoff", siid: this.deviceProperties.set_properties.onoff.siid, piid: this.deviceProperties.set_properties.onoff.piid, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('heater_zhimi_heater_target_temperature', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "target_temperature", siid: this.deviceProperties.set_properties.target_temperature.siid, piid: this.deviceProperties.set_properties.target_temperature.piid, value: Number(value) }], { retries: 1 });
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

      this.registerCapabilityListener('heater_zhimi_heatlevel', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "heater_zhimi_heatlevel", siid: this.deviceProperties.set_properties.heater_zhimi_heatlevel.siid, piid: this.deviceProperties.set_properties.heater_zhimi_heatlevel.piid, value: Number(value) }], { retries: 1 });
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

      this.registerCapabilityListener('heater_zhimi_oscillation', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "heater_zhimi_oscillation", siid: this.deviceProperties.set_properties.heater_zhimi_oscillation.siid, piid: this.deviceProperties.set_properties.heater_zhimi_oscillation.piid, value: value ? 1 : 0 }], { retries: 1 });
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
      await this.miio.call("set_properties", [{ did: "light", siid: this.deviceProperties.set_properties.light.siid, piid: this.deviceProperties.set_properties.light.piid, value: newSettings.led === 0 ? false : true }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      await this.miio.call("set_properties", [{ did: "buzzer", siid: this.deviceProperties.set_properties.buzzer.siid, piid: this.deviceProperties.set_properties.buzzer.piid, value: newSettings.buzzer }], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      await this.miio.call("set_properties", [{ did: "child_lock", siid: this.deviceProperties.set_properties.child_lock.siid, piid: this.deviceProperties.set_properties.child_lock.piid, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_properties", this.deviceProperties.get_properties, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const onoff = result.find(obj => obj.did === 'power');
      const target_temperature = result.find(obj => obj.did === 'target_temperature');
      const measure_temperature = result.find(obj => obj.did === 'temperature');
      
      const led = result.find(obj => obj.did === 'light');
      const buzzer = result.find(obj => obj.did === 'buzzer');
      const child_lock = result.find(obj => obj.did === 'child_lock');

      /* capabilities */
      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("heater_zhimi_heater_target_temperature", target_temperature.value);
      await this.updateCapabilityValue("measure_temperature", measure_temperature.value);
      
      if (this.hasCapability('measure_humidity')) {
        const measure_humidity = result.find(obj => obj.did === 'humidity');
        await this.updateCapabilityValue("measure_humidity", measure_humidity.value);
      }

      if (this.hasCapability('heater_zhimi_heatlevel')) {
        const heater_zhimi_heatlevel = result.find(obj => obj.did === 'heater_zhimi_heatlevel');
        await this.updateCapabilityValue("heater_zhimi_heatlevel", heater_zhimi_heatlevel.value.toString());
      }

      if (this.hasCapability('heater_zhimi_oscillation')) {
        const heater_zhimi_oscillation = result.find(obj => obj.did === 'heater_zhimi_oscillation');
        await this.updateCapabilityValue("heater_zhimi_oscillation", heater_zhimi_oscillation.value === 0 ? false : true);
      }
      
      /* settings */
      await this.updateSettingValue("led", !!led.value);
      await this.updateSettingValue("buzzer", buzzer.value);
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

module.exports = ZhimiHeaterMiotDevice;