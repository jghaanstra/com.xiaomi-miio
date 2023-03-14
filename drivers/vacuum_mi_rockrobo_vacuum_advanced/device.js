'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiRobotAdvancedDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.vacuumErrorCodes = {
        0: "No error",
        1: "Laser distance sensor error",
        2: "Collision sensor error",
        3: "Wheels on top of void, move robot",
        4: "Clean hovering sensors, move robot",
        5: "Clean main brush",
        6: "Clean side brush",
        7: "Main wheel stuck?",
        8: "Device stuck, clean area",
        9: "Dust collector missing",
        10: "Clean filter",
        11: "Stuck in magnetic barrier",
        12: "Low battery",
        13: "Charging fault",
        14: "Battery fault",
        15: "Wall sensors dirty, wipe them",
        16: "Place me on flat surface",
        17: "Side brushes problem, reboot me",
        18: "Suction fan problem",
        19: "Unpowered charging station",
      };

      // RESET CONSUMABLE ALARMS
      this.updateCapabilityValue("alarm_main_brush_work_time", false);
      this.updateCapabilityValue("alarm_side_brush_work_time", false);
      this.updateCapabilityValue("alarm_filter_work_time", false);
      this.updateCapabilityValue("alarm_sensor_dirty_time", false);

      // DEVICE TOKENS
      this.main_brush_lifetime_token = await this.homey.flow.createToken("main_brush_lifetime"+ this.getData().id, {type: "number", title: "Main Brush Lifetime " + this.getName() +" (%)" });
      this.side_brush_lifetime_token = await this.homey.flow.createToken("side_brush_lifetime"+ this.getData().id, {type: "number", title: "Side Brush Lifetime " + this.getName() +" (%)" });
      this.filter_lifetime_token = await this.homey.flow.createToken("filter_lifetime"+ this.getData().id, {type: "number", title: "Filter LifeTime " + this.getName() +" (%)" });
      this.sensor_dirty_lifetime_token = await this.homey.flow.createToken("sensor_dirty_lifetime"+ this.getData().id, {type: "number", title: "Sensor Dirty Time " + this.getName() +" (%)" });
      this.total_work_time_token = await this.homey.flow.createToken("total_work_time"+ this.getData().id, {type: "number", title: "Total Work Time " + this.getName() +" h)" });
      this.total_cleared_area_token = await this.homey.flow.createToken("total_cleared_area"+ this.getData().id, {type: "number", title: "Total Cleaned Area " + this.getName() +" (m2)" });
      this.total_clean_count_token = await this.homey.flow.createToken("total_clean_count"+ this.getData().id, {type: "number", title: "Total Clean Count "+ this.getName() });

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('statusVacuum');
      this.homey.flow.getDeviceTriggerCard('alertVacuum');
      this.homey.flow.getDeviceTriggerCard('triggerVacuumRoomSegments');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoffVacuumcleaner.bind(this));
      this.registerCapabilityListener("vacuumcleaner_state", this.onCapabilityVacuumcleanerState.bind(this));
      this.registerCapabilityListener("vacuum_roborock_fanspeed", this.onCapabilityVacuumFanspeed.bind(this));
      this.registerCapabilityListener("vacuum_roborock_mop_intensity", this.onCapabilityVacuumMopIntensity.bind(this));
      this.registerCapabilityListener("button.consumable", this.onCapabilityButtonConsumable.bind(this));

    } catch (error) {
      this.error(error);
    }
  }

  async retrieveDeviceData() {
    try {
      const result = await this.miio.call("get_status", [], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.updateCapabilityValue("vacuum_roborock_fanspeed", result[0]["fan_power"].toString());
      await this.updateCapabilityValue("measure_battery", parseInt(result[0]["battery"]));
      await this.updateCapabilityValue("alarm_battery", parseInt(result[0]["battery"]) === 20 ? true : false);

      if (result[0].hasOwnProperty('error_code')) {
        const error = this.vacuumErrorCodes[result[0].error_code];
        if (this.getSetting('error') !== error ) {
          await this.setSettings({ error: error });
          if (error !== 0) {
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": error }).catch(error => { this.error(error) });
          }
        }
      }

      if (result[0].hasOwnProperty('water_box_mode')) {
        if (!this.hasCapability('vacuum_roborock_mop_intensity')) {
          this.addCapability('vacuum_roborock_mop_intensity')
        } else {
          await this.updateCapabilityValue("vacuum_roborock_mop_intensity", result[0]["water_box_mode"].toString());
        }
      }

      this.vacuumCleanerState(result[0]["state"]);

      const consumables = await this.miio.call("get_consumable", [], { retries: 1 });
      this.vacuumConsumables(consumables);

      const totals = await this.miio.call("get_clean_summary", [], { retries: 1 });
      this.vacuumTotals(totals);

      const rooms = await this.miio.call("get_room_mapping", [], { retries: 1 });
      if (rooms.toString() !== 'unknown_method') {
        if (this.getSetting('rooms') !== rooms ) {
          await this.setSettings({ rooms: rooms.toString() });
          await this.homey.flow.getDeviceTriggerCard('triggerVacuumRoomSegments').trigger(this, {"segments": rooms.toString() }).catch(error => { this.error(error) });
        }
      } else {
        if (this.getSetting('rooms') !== 'Feature Not Supported' ) {
          await this.setSettings({ rooms: 'Feature Not Supported' });
        }
      }

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error);
    }
  }

}

module.exports = MiRobotAdvancedDevice;
