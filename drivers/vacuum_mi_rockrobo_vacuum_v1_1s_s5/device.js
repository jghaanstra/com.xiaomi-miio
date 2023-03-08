'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiRobotV11SS5Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // VARIABLES DEVICE
      this.speeds = {
        101: 0.2,
        102: 0.4,
        103: 0.6,
        104: 0.8,
        105: 1,
      };

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('statusVacuum');
      this.homey.flow.getDeviceTriggerCard('alertVacuum');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call(value ? "app_start" : "app_pause", [], { retries: 1 });
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
            let speed = value * 100;
            if (speed > 0) {
            if (speed > 1 && speed <= 38) {
              return await this.miio.call("set_custom_mode", [38], { retries: 1 });
            } else if (speed > 38 && speed <= 60) {
              return await this.miio.call("set_custom_mode", [60], { retries: 1 });
            } else if (speed > 60 && speed <= 77) {
              return await this.miio.call("set_custom_mode", [77], { retries: 1 });
            } else if (speed > 78 && speed <= 100) {
              return await this.miio.call("set_custom_mode", [90], { retries: 1 });
            }
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

      this.registerCapabilityListener('vacuumcleaner_state', async ( value ) => {
        try {
          if (this.miio) {
            switch (value) {
              case "cleaning":
                await this.miio.activateCleaning();
                return await this.setCapabilityValue('onoff', true);
              case "spot_cleaning":
                await this.miio.activateSpotClean();
                return await this.setCapabilityValue('onoff', true);
              case "stopped":
                await this.miio.pause();
                return await this.setCapabilityValue('onoff', false);
              case "docked":
              case "charging":
                await this.miio.pause();
                await this.miio.activateCharging();
                return await this.setCapabilityValue('onoff', false);
              default:
                this.error("Not a valid vacuumcleaner_state");
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

      this.registerCapabilityListener('button.consumable', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("reset_consumable", ["main_brush_work_time", "side_brush_work_time", "filter_work_time", "sensor_dirty_time"], { retries: 1 });
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

      const result = await this.miio.call("get_status", [], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("onoff", result[0]["state"] === 5 ? true : false);
      await this.updateCapabilityValue("dim", this.speeds[parseInt(result[0]["fan_power"])]);
      await this.updateCapabilityValue("measure_battery", parseInt(result[0]["battery"]));
      await this.updateCapabilityValue("alarm_battery", parseInt(result[0]["battery"]) === 20 ? true : false);

      switch (result[0]["state"]) {
        case 5:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "cleaning") {
            await this.updateCapabilityValue("vacuumcleaner_state", "cleaning");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "cleaning" }).catch(error => { this.error(error) });
          }
        case 11:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "spot_cleaning") {
            await this.updateCapabilityValue("vacuumcleaner_state", "spot_cleaning");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "spot_cleaning" }).catch(error => { this.error(error) });
          }
        case 10:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "stopped") {
            await this.updateCapabilityValue("vacuumcleaner_state", "stopped");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "stopped" }).catch(error => { this.error(error) });
          }
        case 15:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "docker") {
            await this.updateCapabilityValue("vacuumcleaner_state", "docked");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "docked" }).catch(error => { this.error(error) });
          }
        case 8:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "charging") {
            await this.updateCapabilityValue("vacuumcleaner_state", "charging");
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "charging" }).catch(error => { this.error(error) });
          }
        default:
          this.error("Not a valid vacuumcleaner_state");
      }

      const consumables = await this.miio.call("get_consumable", [], { retries: 1 });

      let mainBrushLifeTime = 1080000;
      let mainBrushCurrentLife = parseInt(consumables[0]["main_brush_work_time"]);
      let mainBrushLifeTimePercent = (mainBrushCurrentLife / mainBrushLifeTime) * 100;
      let sideBrushLifeTime = 720000;
      let sideBrushCurrentLife = parseInt(consumables[0]["side_brush_work_time"]);
      let sideBrushLifeTimePercent = (sideBrushCurrentLife / sideBrushLifeTime) * 100;
      let filterLifeTime = 540000;
      let filterCurrentLife = parseInt(consumables[0]["filter_work_time"]);
      let filterLifeTimePercent = (filterCurrentLife / filterLifeTime) * 100;
      let sensorLifeTime = 108000;
      let sensorCurrentLife = parseInt(consumables[0]["main_brush_work_time"]);
      let sensorLifeTimePercent = (sensorCurrentLife / sensorLifeTime) * 100;

      this.setSettings({ main_brush_work_time: parseInt(mainBrushLifeTimePercent) + "%" });
      let main_brush_alarm = 100 - parseInt(mainBrushLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (this.getCapabilityValue("alarm_main_brush_work_time") !== main_brush_alarm) {
        this.updateCapabilityValue("alarm_main_brush_work_time", main_brush_alarm);
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Main Brush", "value": parseInt(mainBrushLifeTimePercent) + "%" }).catch(error => { this.error(error) });
      }
      
      this.setSettings({ side_brush_work_time: parseInt(sideBrushLifeTimePercent) + "%" });
      let side_brush_alarm = 100 - parseInt(sideBrushLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (this.getCapabilityValue("alarm_side_brush_work_time") !== side_brush_alarm) {
        this.updateCapabilityValue("alarm_side_brush_work_time", side_brush_alarm);
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Side Brush", "value": parseInt(sideBrushLifeTimePercent) + "%" }).catch(error => { this.error(error) });
      }

      this.setSettings({ filter_work_time: parseInt(filterLifeTimePercent) + "%" });
      let filter_alarm = 100 - parseInt(filterLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (this.getCapabilityValue("alarm_filter_work_time") !== filter_alarm) {
        this.updateCapabilityValue("alarm_filter_work_time", filter_alarm);
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Filter", "value": parseInt(sideBrushLifeTimePercent) + "%" }).catch(error => { this.error(error) });
      }

      this.setSettings({ sensor_dirty_time: parseInt(sensorLifeTimePercent) + "%" });
      let sensor_alarm = 100 - parseInt(sensorLifeTimePercent) <= this.getSetting("alarm_threshold") ? true : false;
      if (this.getCapabilityValue("alarm_sensor_dirty_time") !== sensor_alarm) {
        this.updateCapabilityValue("alarm_sensor_dirty_time", sensor_alarm);
        await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Sensor", "value": parseInt(sensorLifeTimePercent) + "%" }).catch(error => { this.error(error) });
      }

      const totals = await this.miio.call("get_clean_summary", [], { retries: 1 });
      if (this.getSetting('total_work_time') !== this.convertMS(parseInt(totals[0])) ) {
        await this.setSettings({ total_work_time: this.convertMS(parseInt(totals[0])) });
      }
      if (this.getSetting('total_cleared_area') !== parseInt(totals[1] / 1000000).toString() ) {
        await this.setSettings({ total_cleared_area: parseInt(totals[1] / 1000000).toString() });
      }
      if (this.getSetting('total_clean_count') !== parseInt(totals[2]).toString() ) {
        await this.setSettings({ total_clean_count: parseInt(totals[2]).toString() });
      }

      const rooms = await this.miio.call("get_room_mapping", [], { retries: 1 });
      if (this.getSetting('rooms') !== rooms ) {
        await this.setSettings({ rooms: rooms });
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

  convertMS(milliseconds) {
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day + "Day, " + hour + "h, " + minute + "m, " + seconds + "s";
  }

}

module.exports = MiRobotV11SS5Device;
