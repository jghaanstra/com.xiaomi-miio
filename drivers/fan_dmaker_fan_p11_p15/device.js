'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { did: "power", siid: 2, piid: 1 }, // onoff
  { did: "fan_level", siid: 2, piid: 2 }, // dim
  { did: "mode", siid: 2, piid: 3 }, // dmaker_fan_1c_mode
  { did: "swing_mode", siid: 2, piid: 4 }, // onoff.swing
  { did: "swing_mode_angle", siid: 2, piid: 5 }, // dim.swing_angle
  { did: "fan_speed", siid: 2, piid: 6 }, // dim.fanspeed
  { did: "light", siid: 4, piid: 1 }, // settings.led
  { did: "buzzer", siid: 5, piid: 1 }, // settings.buzzer
  { did: "child_lock", siid: 7, piid: 1 } // settings.childLock
];

const modes = {
  0: "Straight Wind",
  1: "Natural Wind"
};

const swing_mode_angles = {
  1: 30,
  2: 60,
  3: 90,
  4: 120,
  5: 140,
  30: 1,
  60: 2,
  90: 3,
  120: 4,
  140: 5
};

class DmakerFanP11P15Device extends Device {

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
            return await this.miio.call("set_properties", [{ did: "set", siid: 2, piid: 1, value }], { retries: 1 });
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

      this.registerCapabilityListener('onoff.swing', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "set", siid: 2, piid: 4, value }], { retries: 1 });
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
            return await this.miio.call("set_properties", [{ did: "set", siid: 2, piid: 2, value: +value }], { retries: 1 });
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

      this.registerCapabilityListener('dim.swing_angle', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "set", siid: 2, piid: 5, value: swing_mode_angles[+value] }], { retries: 1 });
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

      this.registerCapabilityListener('dim.fanspeed', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "set", siid: 2, piid: 6, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('dmaker_fan_1c_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "set", siid: 2, piid: 3, value: Number(value) }], { retries: 1 });
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
      await this.miio.call("set_properties", [{ did: "set", siid: 4, piid: 1, value: newSettings.led }], { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      await this.miio.call("set_properties", [{ did: "set", siid: 5, piid: 1, value: newSettings.buzzer }], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      await this.miio.call("set_properties", [{ did: "set", siid: 7, piid: 1, value: newSettings.childLock }], { retries: 1 });
    }

    return Promise.resolve(true);
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      const onoff = result.find(obj => obj.did === 'power');
      const onoff_swing_mode = result.find(obj => obj.did === 'swing_mode');
      const dim_fan_level = result.find(obj => obj.did === 'fan_level');
      const dim_swing_mode_angle = result.find(obj => obj.did === 'swing_mode_angle');
      const dim_fan_speed = result.find(obj => obj.did === 'fan_speed');
      const mode = result.find(obj => obj.did === 'mode');
      
      const led = result.find(obj => obj.did === 'light');
      const buzzer = result.find(obj => obj.did === 'buzzer');
      const child_lock = result.find(obj => obj.did === 'child_lock');

      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("onoff.swing", onoff_swing_mode.value);
      await this.updateCapabilityValue("dim", +dim_fan_level.value);
      await this.updateCapabilityValue("dim.swing_angle", swing_mode_angles[+dim_swing_mode_angle.value]);
      await this.updateCapabilityValue("dim.fanspeed", +dim_fan_speed.value);
      
      await this.updateSettingValue("led", !!led.value);
      await this.updateSettingValue("buzzer", buzzer.value);
      await this.updateSettingValue("childLock", child_lock.value);

      /* handle mode updates */
      this.handleModeEvent(mode.value);

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
      if (this.getCapabilityValue('dmaker_fan_1c_mode') !== mode.toString()) {
        const previous_mode = this.getCapabilityValue('dmaker_fan_1c_mode');
        await this.setCapabilityValue('dmaker_fan_1c_mode', mode.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = DmakerFanP11P15Device;
