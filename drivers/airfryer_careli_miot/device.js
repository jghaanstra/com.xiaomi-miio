'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/careli.fryer.maf05a // Xiaomi Smart Air Fryer Pro 4L
// https://home.miot-spec.com/spec/careli.fryer.ybaf04 // KitchenMi Smart Air Fryer 6007WAB
// https://home.miot-spec.com/spec/careli.fryer.ybaf03 // KitchenMi Smart Air Fryer 6007WA
// https://home.miot-spec.com/spec/careli.fryer.maf02c // Mi Smart Air Fryer (3.5L)
// https://home.miot-spec.com/spec/careli.fryer.maf07  // Mi Smart Air Fryer (3.5L)
// https://home.miot-spec.com/spec/careli.fryer.maf02  // Mi Smart Air Fryer (3.5L)


const mapping = {
  "careli.fryer.maf05a": "properties_default",
  "careli.fryer.ybaf04": "properties_default",
  "careli.fryer.ybaf03": "properties_default",
  "careli.fryer.maf02c": "properties_default",
  "careli.fryer.maf07": "properties_default",
  "careli.fryer.maf02": "properties_default",
  "careli.fryer.*": "properties_default",
};

const properties = {
  "properties_default": {
    "get_properties": [
      { did: "status", siid: 2, piid: 1 }, // airfryer_careli_mode
      { did: "fault", siid : 2, piid: 2 }, // settings.error
      { did: "target_time", siid: 2, piid: 3 }, // airfryer_careli_target_time
      { did: "target_temperature", siid: 2, piid: 4 }, // airfryer_careli_target_temperature
      { did: "food_quantity", siid: 3, piid: 6 }, // airfryer_careli_food_quantity
      { did: "preheat_switch", siid: 3, piid: 7 } // onoff.preheat
    ],
    "set_properties": {
      "start_cook": { siid: 2, aiid: 1, did: "call-2-1", in: [] },
      "stop_cook": { siid: 2, aiid: 2, did: "call-2-2", in: [] }
    }
  }
}

const modes = {
  0: "Shutdown",
  1: "Standby",
  2: "Pause",
  3: "Schedule",
  4: "Cooking",
  5: "Preheat",
  6: "Cooked",
  7: "Preheat finished",
  8: "Preheat paused",
  9: "Pause2"
};

class AirfryerCareliMiotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['careli.fryer.*']];

      this.errorCodes = {
        0: "No Error",
        1: "E1",
        2: "E2"
      }

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            if (value) {
              return await this.miio.call("action", this.deviceProperties.set_properties.start_cook, { retries: 1 });
            } else {
              return await this.miio.call("action", this.deviceProperties.set_properties.stop_cook, { retries: 1 });
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

      this.registerCapabilityListener('airfryer_careli_target_time', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 3, value: +value }], { retries: 1 });
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

      this.registerCapabilityListener('airfryer_careli_target_temperature', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 4, value: +value }], { retries: 1 });
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

      this.registerCapabilityListener('onoff.preheat', async ( value ) => {
        try {
          if (this.miio) {
            if (value) {
              return await this.miio.call("set_properties", [{ siid: 3, piid: 7, value: 2 }], { retries: 1 });
            } else {
              return await this.miio.call("set_properties", [{ siid: 3, piid: 7, value: 1 }], { retries: 1 });
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

      this.registerCapabilityListener('airfryer_careli_food_quantity', async ( value ) => {9
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 3, piid: 6, value: +value }], { retries: 1 });
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

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_properties", this.deviceProperties.get_properties, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      /* data */
      const status = result.find(obj => obj.did === 'status');
      const fault = result.find(obj => obj.did === 'fault');
      const target_time = result.find(obj => obj.did === 'target_time');
      const target_temperature = result.find(obj => obj.did === 'target_temperature');
      const food_quantity = result.find(obj => obj.did === 'food_quantity');
      const onoff_preheat = result.find(obj => obj.did === 'preheat_switch');

      /* capabilities */
      await this.updateCapabilityValue("airfryer_careli_target_time", target_time.value);
      await this.updateCapabilityValue("airfryer_careli_target_temperature", target_temperature.value);
      await this.updateCapabilityValue("airfryer_careli_food_quantity", food_quantity.value.toString());

      /* settings */
      const error = this.errorCodes[fault.value];
      await this.updateSettingValue("error", error);

      /* onoff */
      switch (status.value) {
        case 4:
        case 5:
        case 6:
        case 7:
          await this.updateCapabilityValue("onoff", true);
          break;
        default:
          await this.updateCapabilityValue("onoff", false);
          break;
      }

      /* onoff.preheat */
      switch (onoff_preheat.value) {
        case 2:
          await this.updateCapabilityValue("onoff.preheat", true);
          break;
        default:
          await this.updateCapabilityValue("onoff.preheat", false);
          break;
      }

      /* mode capability */
      if (this.getCapabilityValue('airfryer_careli_mode') !== status.value.toString()) {
        const previous_mode = this.getCapabilityValue('airfryer_careli_mode');
        await this.setCapabilityValue('airfryer_careli_mode', status.value.toString());
        await this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": modes[status.value], "previous_mode": modes[+previous_mode] }).catch(error => { this.error(error) });
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

module.exports = AirfryerCareliMiotDevice;