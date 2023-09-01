'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.humidifier.ca4

const params = [
  { did: "power", siid: 2, piid: 2 }, // onoff
  { did: "mode", siid: 2, piid: 5 }, // humidifier_zhimi_mode_miot
  { did: "target_humidity", siid: 2, piid: 6 }, // dim.target [30, 40, 50, 60, 70, 80]
  { did: "humidity", siid: 3, piid: 9 }, // measure_humidity
  { did: "water_level", siid: 2, piid: 7 }, // measure_waterlevel
  { did: "dry", siid: 2, piid: 8 }, // onoff.dry
  { did: "speed_level", siid: 2, piid: 11 }, // dim [200 - 2000]
  { did: "temperature", siid: 3, piid: 7 }, // measure_temperature
  { did: "buzzer", siid: 4, piid: 1 }, // settings.buzzer
  { did: "child_lock", siid: 6, piid: 1 }, // settings.childLock
  { did: "light", siid: 5, piid: 2 } // settings.led
];

const modes = {
  0: "Auto",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3"
};

class MiHumidifierCa4Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');
      this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
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

      this.registerCapabilityListener('onoff.dry', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 8, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.miio) {
            const speed = this.util.denormalize(value, 200, 2000);
            return await this.miio.call("set_properties", [{ siid: 2, piid: 6, value: speed }], { retries: 1 });
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

      this.registerCapabilityListener('humidifier_zhimi_mode_miot', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 5, value: Number(value) }], { retries: 1 });
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
      const led = await this.miio.call("set_properties", [{ siid: 5, piid: 2, value: newSettings.led ? 2 : 0 }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_properties", [{ siid: 4, piid: 1, value: newSettings.buzzer }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const childlock = await this.miio.call("set_properties", [{ siid: 6, piid: 1, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const onoff = result.find(obj => obj.did === 'power');
      const dim_target = result.find(obj => obj.did === 'target_humidity');
      const measure_humidity = result.find(obj => obj.did === 'humidity');
      const onoff_dry = result.find(obj => obj.did === 'dry');
      const dim = result.find(obj => obj.did === 'speed_level');
      const measure_temperature = result.find(obj => obj.did === 'temperature');
      const buzzer = result.find(obj => obj.did === 'buzzer');
      const child_lock = result.find(obj => obj.did === 'child_lock');
      const led = result.find(obj => obj.did === 'light');

      /* capabilities */
      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("dim.target", dim_target.value);
      await this.updateCapabilityValue("measure_humidity", measure_humidity.value);
      await this.updateCapabilityValue("onoff.dry", onoff_dry.value);
      await this.updateCapabilityValue("dim", this.util.normalize(dim.value, 200, 2000));
      await this.updateCapabilityValue("measure_temperature", measure_temperature.value);
      
      /* settings */
      await this.updateSettingValue("led", led.value);
      await this.updateSettingValue("buzzer", buzzer.value);
      await this.updateSettingValue("childLock", child_lock.value);      

      /* mode capability */
      const mode = result.find(obj => obj.did === 'mode');
      if (this.getCapabilityValue('humidifier_zhimi_mode_miot') !== mode.value.toString()) {
        const previous_mode = this.getCapabilityValue('humidifier_zhimi_mode_miot');
        await this.setCapabilityValue('humidifier_zhimi_mode_miot', mode.value.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode.value], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
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

module.exports = MiHumidifierCa4Device;