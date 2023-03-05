'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const modes = {
  1: "low",
  2: "medium",
  3: "high",
  4: "humidity",
};

const modesID = {
  low: 1,
  medium: 2,
  high: 3,
  humidity: 4,
};

class HumidifierDeermaMJJSQDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("Set_OnOff", [value ? 1 : 0]);
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
            return await this.miio.call("set_dry", [value ? 1 : 0]);
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
            let humidity = value * 100;
            if (humidity > 0) {
              return await this.miio.call("Set_HumiValue", [humidity]);
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

      this.registerCapabilityListener('humidifier_deerma_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("Set_HumidifierGears", [modesID[value]]);
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
      const led = await this.miio.call("SetLedState", [newSettings.led ? 1 : 0]);
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("SetTipSound_Status", [newSettings.buzzer ? 1 : 0]);
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_prop", ["Humidifier_Gear", "Humidity_Value", "HumiSet_Value", "Led_State", "OnOff_State", "TemperatureValue", "TipSound_State", "waterstatus", "watertankstatus"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("measure_humidity", parseInt(result[1]));
      await this.updateCapabilityValue("dim", parseInt(result[2]) / 100);
      await this.updateCapabilityValue("onoff", result[4] === 1 ? true : false);
      await this.updateCapabilityValue("measure_temperature", parseInt(result[5]));
      await this.updateCapabilityValue("alarm_water", result[7] === 0 ? true : false);
      await this.updateCapabilityValue("alarm_motion.tank", result[8] === 0 ? true : false);
      
      await this.setSettings({ led: result[3] === 1 ? true : false });
      await this.setSettings({ buzzer: result[6] === 1 ? true : false });

      /* mode trigger card */
      this.handleModeEvent(result[0]);

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error.message);
    }
  }

  async handleModeEvent(mode) {
    try {
      if (this.getCapabilityValue('humidifier_deerma_mode') !== modes[mode]) {
        const previous_mode = this.getCapabilityValue('humidifier_deerma_mode');
        await this.setCapabilityValue('humidifier_deerma_mode', modes[mode]);
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": previous_mode }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = HumidifierDeermaMJJSQDevice;
