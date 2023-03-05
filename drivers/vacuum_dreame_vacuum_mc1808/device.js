'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { siid: 2, piid: 1 },
  { siid: 3, piid: 1 },
  { siid: 3, piid: 2 },
  { siid: 26, piid: 1 },
  { siid: 26, piid: 2 },
  { siid: 27, piid: 1 },
  { siid: 27, piid: 2 },
  { siid: 28, piid: 1 },
  { siid: 28, piid: 2 },
  { siid: 18, piid: 6 },
  { siid: 18, piid: 20 }
];

const errors = {
  0: "Normal",
  1: "Drop",
  2: "Cliff",
  3: "Bumper",
  4: "Gesture",
  5: "Bumper Repeat",
  6: "Drop Repeat",
  7: "Optical Flow",
  8: "No Container",
  9: "No Tank",
  10: "Waterbox Empty",
  11: "Container Full",
  12: "Brush",
  13: "Sidebrush",
  14: "Fan",
  15: "Left Wheel Motor",
  16: "Right Wheel Motor",
  17: "Turn Soffacate",
  18: "Forward Soffacate",
  19: "Charger Get",
  20: "Battery Low",
  21: "Charge Fault",
  22: "Battery Percentage",
  23: "Heart",
  24: "Camera Occlusion",
  25: "Camera Fault",
  26: "Event Battery",
  27: "Forward Looking",
  28: "Gyroscope"
}

class DreameMC1808Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('alertVacuum');
      this.homey.flow.getDeviceTriggerCard('statusVacuum');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            if (value) {
              return await this.miio.call("action", { siid: 3, aiid: 1, did: "call-3-1", in: [] }, { retries: 1 });
            } else {
              return await this.miio.call("action", { siid: 3, aiid: 2, did: "call-3-2", in: [] }, { retries: 1 });
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

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 18, piid: 6, value }], { retries: 1 });
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

      this.registerCapabilityListener('dim.water', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 18, piid: 20, value }], { retries: 1 });
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

      this.registerCapabilityListener('vacuumcleaner_state', async ( value ) => {
        try {
          if (this.miio) {
            return Promise.reject('Setting vacuumcleaner_state is not available for this device ...');
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

      this.registerCapabilityListener('button.consumable', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("reset_consumable", ["main_brush_work_time", "side_brush_work_time", "filter_work_time"], { retries: 1 });
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

      const result = await this.miio.call("get_properties", params, { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      const batteryResult = result.filter(r => r.siid == 2 && r.piid == 1)[0];
      const deviceFaultResult = result.filter((r) => r.siid == 2 && r.piid == 2)[0];
      const deviceStatusResult = result.filter(r => r.siid == 3 && r.piid == 2)[0];
      const deviceFanSpeedResult = result.filter(r => r.siid == 18 && r.piid == 6)[0];
      const deviceMopSpeedResult = result.filter(r => r.siid == 18 && r.piid == 20)[0];
      const deviceMainBrushProcentResult = result.filter(r => r.siid == 26 && r.piid == 2)[0];
      const deviceFilterProcentResult = result.filter(r => r.siid == 27 && r.piid == 1)[0];
      const deviceLeftBrushProcentResult = result.filter(r => r.siid == 28 && r.piid == 2)[0];

      await this.updateCapabilityValue("measure_battery", +batteryResult.value);
      await this.updateCapabilityValue("alarm_battery", +batteryResult.value <= 20 ? true : false);

      
      if (deviceStatusResult.value == 1) {
        await this.updateCapabilityValue("onoff", true);
      } else if (deviceStatusResult.value == 6) {
        await this.updateCapabilityValue("onoff", false);
      }

      await this.updateCapabilityValue("dim", +deviceFanSpeedResult.value);
      await this.updateCapabilityValue("dim.water", +deviceMopSpeedResult.value);

      await this.setSettings({ main_brush_work_time: deviceMainBrushProcentResult.value + "%" }).catch(error => this.log("Set Settings Error", error));
      await this.setSettings({ side_brush_work_time: deviceLeftBrushProcentResult.value + "%" }).catch(error => this.log("Set Settings Error", error));
      await this.setSettings({ filter_work_time: deviceFilterProcentResult.value + "%" }).catch(error => this.log("Set Settings Error", error));
      
      switch (deviceStatusResult.value) {
        case 1:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "cleaning") {
            await this.updateCapabilityValue("vacuumcleaner_state", "cleaning");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "cleaning" }).catch(error => { this.error(error) });
          }        case 2:
        case 3:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "stopped") {
            await this.updateCapabilityValue("vacuumcleaner_state", "stopped");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "stopped" }).catch(error => { this.error(error) });
          }
        case 4:
          await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "error: "+ errors[deviceFaultResult.value] }).catch(error => { this.error(error) });
        case 5:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "docker") {
            await this.updateCapabilityValue("vacuumcleaner_state", "docked");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "docked" }).catch(error => { this.error(error) });
          }
        case 6:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "charging") {
            await this.updateCapabilityValue("vacuumcleaner_state", "charging");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "charging" }).catch(error => { this.error(error) });
          }
        default:
          this.error("Not a valid vacuumcleaner_state");
      }

      if (deviceMainBrushProcentResult.value <= this.getSetting("alarm_threshold") ? true : false) {
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Main Brush", "value": "true" }).catch(error => { this.error(error) });
      }
      if (deviceLeftBrushProcentResult.value <= this.getSetting("alarm_threshold") ? true : false) {
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Side Brush", "value": "true" }).catch(error => { this.error(error) });
      }
      if (deviceFilterProcentResult.value <= this.getSetting("alarm_threshold") ? true : false) {
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Filter", "value": "true" }).catch(error => { this.error(error) });
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

module.exports = DreameMC1808Device;
