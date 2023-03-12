'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const modes = {
  1: "Level 1",
  2: "Level 2",
  3: "Humidity"
};

class HumidifierDeermaJSQDevice extends Device {

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
            return await this.miio.call("Set_OnOff", [+value]);
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
            return await this.miio.call("Set_HumiValue", [value]);
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

      this.registerCapabilityListener('humidifier_deerma_jsq4_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("Set_HumidifierGears", [+value]);
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

      const result = await this.miio.call("get_prop", ["OnOff_State", "TemperatureValue", "Humidity_Value", "HumiSet_Value", "Humidifier_Gear", "waterstatus", "Led_State", "TipSound_State"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", !!result[0]);
      await this.updateCapabilityValue("measure_temperature", parseInt(result[1]));
      await this.updateCapabilityValue("measure_humidity", parseInt(result[2]));
      await this.updateCapabilityValue("dim", parseInt(result[3]));
      await this.updateCapabilityValue("alarm_water", !!!result[5]);
      
      await this.setSettings({ led: result[6] === 1 ? true : false });
      await this.setSettings({ buzzer: result[7] === 1 ? true : false });

      /* mode trigger card */
      this.handleModeEvent(result[4]);

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
      let new_mode = '';

      switch (mode) {
        case '0':
        case 'idle':
          new_mode = '1';
          break;
        case '1':
        case 'silent':
          new_mode = '1';
          break;
        case '2':
        case 'medium':
          new_mode = '2';
          break;
        case '3':
        case 'high':
          new_mode = '3';
          break;
      }

      if (this.getCapabilityValue('humidifier_deerma_jsq4_mode') !== mode.toString()) {
        const previous_mode = this.getCapabilityValue('humidifier_deerma_jsq4_mode');
        await this.setCapabilityValue('humidifier_deerma_jsq4_mode', mode.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = HumidifierDeermaJSQDevice;