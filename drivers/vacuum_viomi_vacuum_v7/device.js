'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class ViomiV7Device extends Device {

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
              return await this.miio.call("set_mode_withroom", [0, 1, 0], { refresh: ["state"], refreshDelay: 1000});
            } else {
              return await this.miio.call("set_charge", [1], { refresh: ["state"], refreshDelay: 1000 });
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
            if (value === 0) {
              return await this.miio.call("set_mode", [0], { refresh: ["state"], refreshDelay: 1000 });
            } else {
              return await this.miio.call("set_suction", [value], { refresh: ["fanSpeed"] });
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

      this.registerCapabilityListener('dim.water', async ( value ) => {
        try {
          if (this.miio) {
            const speeds = { 0: 11, 1: 12, 2: 13 };
            return await this.miio.call("set_suction", [speeds[value]], { refresh: ["waterBoxMode"] });
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

      this.registerCapabilityListener('vacuum_viomi_mop_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_mop", [Number(value)], { retries: 1 });
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

      const result = await this.miio.call("get_prop", ["run_state", "suction_grade", "battary_life", "is_mop", "water_grade", "mop_route", "main_brush_life", "side_brush_life", "hypa_life"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      if (result[0] == 3) {
        await this.updateCapabilityValue("onoff", true);
      } else if (result[0] == 6 || result[0] == 7) {
        await this.updateCapabilityValue("onoff", true);
      } else if (result[0] == 5) {
        await this.updateCapabilityValue("onoff", false);
      } else if (result[0] == 3) {
        await this.updateCapabilityValue("onoff", false);
      } else if (result[0] == 2) {
        await this.updateCapabilityValue("onoff", true);
      }

      switch (parseInt(result[1])) {
        case 0:
          await this.updateCapabilityValue("dim", 0.25);
          break;
        case 1:
          await this.updateCapabilityValue("dim", 0.5);
          break;
        case 2:
          await this.updateCapabilityValue("dim", 0.75);
          break;
        case 3:
          await this.updateCapabilityValue("dim", 1);
          break;
      }

      await this.updateCapabilityValue("measure_battery", parseInt(result[2]));
      await this.updateCapabilityValue("alarm_battery", parseInt(result[2]) <= 20 ? true : false);
      await this.updateCapabilityValue("vacuum_viomi_mop_mode", parseInt(result[3]));

      switch (parseInt(result[4])) {
        case 0:
          await this.updateCapabilityValue("dim.water", 0.33);
          break;
        case 1:
          await this.updateCapabilityValue("dim.water", 0.66);
          break;
        case 2:
          await this.updateCapabilityValue("dim.water", 1);
          break;
      }

      const mainBrushLifeTime = 1080000;
      const mainBrushCurrentLife = parseInt(result[6]);
      const mainBrushLifeTimePercent = (mainBrushCurrentLife / mainBrushLifeTime) * 100;
      const sideBrushLifeTime = 720000;
      const sideBrushCurrentLife = parseInt(result[7]);
      const sideBrushLifeTimePercent = (sideBrushCurrentLife / sideBrushLifeTime) * 100;
      const filterLifeTime = 540000;
      const filterCurrentLife = parseInt(result[8]);
      const filterLifeTimePercent = (filterCurrentLife / filterLifeTime) * 100;

      this.setSettings({ main_brush_work_time: parseInt(mainBrushLifeTimePercent) + "%" });
      let main_brush_alarm = 100 - parseInt(mainBrushLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (main_brush_alarm) {
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Main Brush", "value": parseInt(mainBrushLifeTimePercent) + "%" }).catch(error => { this.error(error) });
      }

      this.setSettings({ side_brush_work_time: parseInt(sideBrushLifeTimePercent) + "%" });
      let side_brush_alarm = 100 - parseInt(sideBrushLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (side_brush_alarm) {
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Side Brush", "value": parseInt(sideBrushLifeTimePercent) + "%" }).catch(error => { this.error(error) });
      }

      this.setSettings({ filter_work_time: parseInt(filterLifeTimePercent) + "%" });
      let filter_alarm = 100 - parseInt(filterLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (filter_alarm) {
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Filter", "value": parseInt(sideBrushLifeTimePercent) + "%" }).catch(error => { this.error(error) });
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

module.exports = ViomiV7Device;
