'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/xiaomi.humidifier.airmx

const mapping = {
  "xiaomi.humidifier.airmx": "default_properties",
  "xiaomi.humidifier.*": "default_properties"
};

const properties = {
  "default_properties": {
    "get_properties": [
      { did: "onoff", siid: 2, piid: 1 }, // onoff
      { did: "error", siid: 2, piid: 2 }, // settings.error
      { did: "mode", siid: 2, piid: 3 }, // humidifier_xiaomi_mode
      { did: "target_humidity", siid: 2, piid: 6 }, // target_humidity [40, 50, 60, 70]
      { did: "water_level", siid: 2, piid: 7 }, // measure_waterlevel
      { did: "dry", siid: 2, piid: 12 }, // onoff.dry
      { did: "humidity", siid: 3, piid: 1 }, // measure_humidity
      { did: "temperature", siid: 3, piid: 2 }, // measure_temperature
      { did: "child_lock", siid: 11, piid: 1 }, // settings.childLock
      { did: "buzzer", siid: 14, piid: 1 }, // settings.buzzer
      { did: "light", siid: 15, piid: 2 } // settings.led      
    ],
    "set_properties": {
      "onoff": { siid: 2, piid: 1 },
      "mode": { siid: 2, piid: 3 },
      "target_humidity": { siid: 2, piid: 6 },
      "onoff_dry": { siid: 2, piid: 12 },
      "child_lock": {siid: 11, piid: 1 },
      "buzzer": {siid: 14, piid: 1 },
      "light": {siid: 15, piid: 1 }
    }
  }
}

class XiaomiHumidifierMIoTDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');
      this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel');

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['xiaomi.humidifier.*']];

      this.modes = {
        0: "Constant Humidity",
        1: "Strong",
        2: "Sleep",
        3: "Air-dry",
        4: "Clean",
        5: "Descale"
      };

      this.errorCodes = {
        0: "No Error",
        1: "Pump",
        2: "Low Water",
        3: "Pump Low Water"
      }

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

      this.registerCapabilityListener('humidifier_xiaomi_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.mode.siid, piid: this.deviceProperties.set_properties.mode.piid, value: Number(value) }], { retries: 1 });
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

      this.registerCapabilityListener('target_humidity', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.target_humidity.siid, piid: this.deviceProperties.set_properties.target_humidity.piid, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('onoff.dry', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "onoff", siid: this.deviceProperties.set_properties.onoff_dry.siid, piid: this.deviceProperties.set_properties.onoff_dry.piid, value: value }], { retries: 1 });
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
      const onoff = result.find(obj => obj.did === 'onoff');
      const target_humidity = result.find(obj => obj.did === 'target_humidity');
      const onoff_dry = result.find(obj => obj.did === 'dry');
      const measure_humidity = result.find(obj => obj.did === 'humidity');
      const measure_temperature = result.find(obj => obj.did === 'temperature');
      const child_lock = result.find(obj => obj.did === 'child_lock');
      const buzzer = result.find(obj => obj.did === 'buzzer');
      const led = result.find(obj => obj.did === 'light');

      /* capabilities */
      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("target_humidity", target_humidity.value);
      await this.updateCapabilityValue("onoff.dry", onoff_dry.value);
      await this.updateCapabilityValue("measure_humidity", measure_humidity.value);
      await this.updateCapabilityValue("measure_temperature", measure_temperature.value);

      /* settings */
      await this.updateSettingValue("childLock", child_lock.value);
      await this.updateSettingValue("buzzer", buzzer.value);
      await this.updateSettingValue("led", led.value);

      /* settings device error */
      const error_value = result.find(obj => obj.did === 'error');
      const error = this.errorCodes[error_value.value];
      await this.updateSettingValue("error", error);

      /* mode capability */
      const mode = result.find(obj => obj.did === 'mode');
      if (this.getCapabilityValue('humidifier_xiaomi_mode') !== mode.value.toString()) {
        const previous_mode = this.getCapabilityValue('humidifier_xiaomi_mode');
        await this.setCapabilityValue('humidifier_xiaomi_mode', mode.value.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": this.modes[mode.value], "previous_mode": this.modes[+previous_mode] }).catch(error => { this.error(error) });
      }

      /* measure_waterlevel capability */
      const measure_waterlevel = result.find(obj => obj.did === 'water_level');
      if (this.getCapabilityValue('measure_waterlevel') !== measure_waterlevel.value) {
        const previous_waterlevel = await this.getCapabilityValue('measure_waterlevel');
        await this.setCapabilityValue('measure_waterlevel', measure_waterlevel.value);
        await this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel').trigger(this, {"waterlevel": measure_waterlevel.value, "previous_waterlevel": previous_waterlevel }).catch(error => { this.error(error) });
      }

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

module.exports = XiaomiHumidifierMIoTDevice;