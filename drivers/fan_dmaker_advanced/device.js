'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/dmaker.fan.p9
// https://home.miot-spec.com/spec/dmaker.fan.p10
// https://home.miot-spec.com/spec/dmaker.fan.p11
// https://home.miot-spec.com/spec/dmaker.fan.p15
// https://home.miot-spec.com/spec/dmaker.fan.p18
// https://home.miot-spec.com/spec/dmaker.fan.p33
// https://home.miot-spec.com/spec/dmaker.fan.1c

const mapping = {
  "dmaker.fan.p9": "properties_p9",
  "dmaker.fan.p10": "properties_p10",
	"dmaker.fan.p11": "properties_p11",
	"dmaker.fan.p15": "properties_p11",
	"dmaker.fan.p18": "properties_p10",
	"dmaker.fan.p33": "properties_p33",
	"dmaker.fan.1c": "properties_1c"
};

const properties = {
  "properties_p9": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "fan_level", siid: 2, piid: 2 }, // dim
      { did: "mode", siid: 2, piid: 4 }, // fan_dmaker_mode
      { did: "swing_mode", siid: 2, piid: 5 }, // onoff.swing
      { did: "swing_mode_angle", siid: 2, piid: 6 }, // dim.swing_angle
      { did: "fan_speed", siid: 2, piid: 11 }, // dim.fanspeed
      { did: "light", siid: 2, piid: 9 }, // settings.led
      { did: "buzzer", siid: 2, piid: 7 }, // settings.buzzer
      { did: "child_lock", siid: 3, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "swing_mode": { siid: 2, piid: 5 },
      "swing_mode_angle": { siid: 2, piid: 6 },
      "fan_speed": { siid: 2, piid: 11 },
      "mode": { siid: 2, piid: 4 },
      "light": {siid: 2, piid: 9 },
      "buzzer": {siid: 2, piid: 7 },
      "child_lock": {siid: 3, piid: 1 }
    }
  },
  "properties_p10": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "fan_level", siid: 2, piid: 2 }, // dim
      { did: "mode", siid: 2, piid: 3 }, // fan_dmaker_mode
      { did: "swing_mode", siid: 2, piid: 4 }, // onoff.swing
      { did: "swing_mode_angle", siid: 2, piid: 5 }, // dim.swing_angle
      { did: "fan_speed", siid: 2, piid: 10 }, // dim.fanspeed
      { did: "light", siid: 2, piid: 7 }, // settings.led
      { did: "buzzer", siid: 2, piid: 8 }, // settings.buzzer
      { did: "child_lock", siid: 3, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "swing_mode": { siid: 2, piid: 4 },
      "swing_mode_angle": { siid: 2, piid: 5 },
      "fan_speed": { siid: 2, piid: 10 },
      "mode": { siid: 2, piid: 3 },
      "light": { siid: 2, piid: 7 },
      "buzzer": {siid: 2, piid: 8 },
      "child_lock": {siid: 3, piid: 1 }
    }
  },
  "properties_p11": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "fan_level", siid: 2, piid: 2 }, // dim
      { did: "mode", siid: 2, piid: 3 }, // fan_dmaker_mode
      { did: "swing_mode", siid: 2, piid: 4 }, // onoff.swing
      { did: "swing_mode_angle", siid: 2, piid: 5 }, // dim.swing_angle
      { did: "fan_speed", siid: 2, piid: 6 }, // dim.fanspeed
      { did: "light", siid: 4, piid: 1 }, // settings.led
      { did: "buzzer", siid: 5, piid: 1 }, // settings.buzzer
      { did: "child_lock", siid: 7, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "swing_mode": { siid: 2, piid: 4 },
      "swing_mode_angle": { siid: 2, piid: 5 },
      "fan_speed": { siid: 2, piid: 6 },
      "mode": { siid: 2, piid: 3 },
      "light": { siid: 4, piid: 1 },
      "buzzer": { siid: 5, piid: 1 },
      "child_lock": { siid: 7, piid: 1 }
    }
  },
  "properties_p33": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "fan_level", siid: 2, piid: 2 }, // dim
      { did: "mode", siid: 2, piid: 3 }, // fan_dmaker_mode
      { did: "swing_mode", siid: 2, piid: 4 }, // onoff.swing
      { did: "swing_mode_angle", siid: 2, piid: 5 }, // dim.swing_angle
      { did: "fan_speed", siid: 2, piid: 6 }, // dim.fanspeed
      { did: "light", siid: 4, piid: 1 }, // settings.led
      { did: "buzzer", siid: 5, piid: 1 }, // settings.buzzer
      { did: "child_lock", siid: 7, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "swing_mode": { siid: 2, piid: 4 },
      "swing_mode_angle": { siid: 2, piid: 5 },
      "fan_speed": { siid: 2, piid: 6 },
      "mode": { siid: 2, piid: 3 },
      "light": { siid: 4, piid: 1 },
      "buzzer": { siid: 5, piid: 1 },
      "child_lock": { siid: 7, piid: 1 }
    }
  },
  "properties_1c": {
    "get_properties": [
      { did: "power", siid: 2, piid: 1 }, // onoff
      { did: "fan_level", siid: 2, piid: 2 }, // dim
      { did: "mode", siid: 2, piid: 7 }, // fan_dmaker_mode
      { did: "swing_mode", siid: 2, piid: 3 }, // onoff.swing
      { did: "light", siid: 2, piid: 12 }, // setting.led
      { did: "buzzer", siid: 2, piid: 11 }, // settings.buzzer
      { did: "child_lock", siid: 3, piid: 1 } // settings.childLock
    ],
    "set_properties": {
      "swing_mode": { siid: 2, piid: 3 },
      "mode": { siid: 2, piid: 7 },
      "light": { siid: 2, piid: 12 },
      "buzzer": { siid: 2, piid: 11 },
      "child_lock": { siid: 3, piid: 1 }
    }
  }
}

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

      // ADD DEVICES DEPENDANT CAPABILITIES
      if (this.getStoreValue('model') === 'dmaker.fan.1c') {
        if (this.hasCapability('dim.swing_angle')) {
          this.removeCapability('dim.swing_angle');
        }
        if (this.hasCapability('dim.fanspeed')) {
          this.removeCapability('dim.fanspeed');
        }
      }

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]];

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "onoff", siid: 2, piid: 1, value: value }], { retries: 1 });
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
            return await this.miio.call("set_properties", [{ did: "swing_mode", siid: this.deviceProperties.set_properties.swing_mode.siid, piid: this.deviceProperties.set_properties.swing_mode.piid, value: value ? 1 : 0 }], { retries: 1 });
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
            return await this.miio.call("set_properties", [{ did: "fan_level", siid: 2, piid: 2, value: value }], { retries: 1 });
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
            return await this.miio.call("set_properties", [{ did: "swing_mode_angle", siid: this.deviceProperties.set_properties.swing_mode_angle.siid, piid: this.deviceProperties.set_properties.swing_mode_angle.piid, value: swing_mode_angles[+value] }], { retries: 1 });
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
            return await this.miio.call("set_properties", [{ did: "fan_speed", siid: this.deviceProperties.set_properties.fan_speed.siid, piid: this.deviceProperties.set_properties.fan_speed.piid, value: value }], { retries: 1 });
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

      this.registerCapabilityListener('fan_dmaker_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ did: "set", siid: this.deviceProperties.set_properties.mode.siid, piid: this.deviceProperties.set_properties.mode.piid, value: Number(value) }], { retries: 1 });
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
      await this.miio.call("set_properties", [{ did: "light", siid: this.deviceProperties.set_properties.light.siid, piid: this.deviceProperties.set_properties.light.piid, value: newSettings.led }], { retries: 1 });
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

      const onoff = result.find(obj => obj.did === 'power');
      const onoff_swing_mode = result.find(obj => obj.did === 'swing_mode');
      const dim_fan_level = result.find(obj => obj.did === 'fan_level');
      const mode = result.find(obj => obj.did === 'mode');
      
      const led = result.find(obj => obj.did === 'light');
      const buzzer = result.find(obj => obj.did === 'buzzer');
      const child_lock = result.find(obj => obj.did === 'child_lock');

      await this.updateCapabilityValue("onoff", onoff.value);
      await this.updateCapabilityValue("onoff.swing", onoff_swing_mode.value);
      await this.updateCapabilityValue("dim", +dim_fan_level.value);
      

      if (this.hasCapability('dim.swing_angle')) {
        const dim_swing_mode_angle = result.find(obj => obj.did === 'swing_mode_angle');
        await this.updateCapabilityValue("dim.swing_angle", swing_mode_angles[+dim_swing_mode_angle.value]);
      }
      if (this.hasCapability('dim.fanspeed')) {
        const dim_fan_speed = result.find(obj => obj.did === 'fan_speed');
        await this.updateCapabilityValue("dim.fanspeed", +dim_fan_speed.value);
      }
      
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
      if (this.getCapabilityValue('fan_dmaker_mode') !== mode.toString()) {
        const previous_mode = this.getCapabilityValue('fan_dmaker_mode');
        await this.setCapabilityValue('fan_dmaker_mode', mode.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[mode], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
      }
    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = DmakerFanP11P15Device;
