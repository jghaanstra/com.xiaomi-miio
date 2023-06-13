'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/roidmi.vacuum.v60 // Roidmi Eve
// https://home.miot-spec.com/spec/roidmi.vacuum.v66 // Roidmi Eva


const mapping = {
  "roidmi.vacuum.v60": "properties_default",
  "roidmi.vacuum.v66": "properties_default",
  "roidmi.vacuum.*": "properties_default",
};

const properties = {
  "properties_default": {
    "get_properties": [
      { did: "battery", siid: 3, piid: 1 }, // measure_battery
      { did: "charge_state", siid: 3, piid: 2 },
      { did: "device_fault", siid : 2, piid: 2 }, // settings.error
      { did: "device_status", siid: 2, piid: 1 }, // vacuumcleaner_state
      { did: "fan_speed", siid: 2, piid: 4 }, // vacuum_roidmi_fanspeed
      { did: "sweep_mode", siid: 14, piid: 1 },
      { did: "sweep_type", siid: 2, piid: 8 }, // vacuum_roidmi_mop_mode
      { did: "water_level", siid: 8, piid: 11 }, // vacuum_roidmi_waterlevel
      { did: "main_brush_time_remaining", siid: 11, piid: 2 }, // settings.main_brush_time_remaining
      { did: "side_brush_time_remaining", siid: 12, piid: 2 }, // settings.side_brush_time_remaining
      { did: "filter_time_remaining", siid: 10, piid: 1 }, // settings.filter_time_remaining
      { did: "sensor_time_remaining", siid: 15, piid: 2 }, // settings.sensor_time_remaining
      { did: "total_clean_area", siid: 8, piid: 14 }, // settings.total_cleared_area
      { did: "total_clean_count", siid: 8, piid: 18 }, // settings.clean_count
      { did: "total_clean_time", siid: 8, piid: 13 } // settings.total_work_time      
    ],
    "set_properties": {
      "start_clean": { siid: 2, aiid: 1, did: "call-2-1", in: [] },
      "stop_clean": { siid: 2, aiid: 2, did: "call-2-2", in: [] },
      "find": { siid: 8, aiid: 1, did: "call-8-1", in: [] },
      "home": { siid: 3, aiid: 3, did: "call-3-1", in: [] },
      "fanspeed": { siid: 2, piid: 4 },
      "mopmode": { siid: 2, piid: 8 }
    }
  }
}

class RoidmiMiotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping['roidmi.vacuum.*']];

      var errorCodes = {
        0: "No Error",
        1: "Low Battery Find Charger",
        2: "Low Battery And Poweroff",
        3: "Wheel Trap",
        4: "Collision Error",
        5: "Tile Do Task",
        6: "Lidar Point Error",
        7: "Front Wall Error",
        8: "Psd Dirty",
        9: "Middle Brush Fatal",
        10: "Sid Brush",
        11: "Fan Speed Error",
        12: "Lidar Cover",
        13: "Garbage Box Full",
        14: "Garbage Box Out",
        15: "Garbage Box Full Out",
        16: "Physical Trapped",
        17: "Pick Up Do Task",
        18: "No Water Box Do Task",
        19: "Water Box Empty",
        20: "Clean Cannot Arrive",
        21: "Start Form Forbid",
        22: "Drop",
        23: "Kit Water Pump",
        24: "Find Charger Failed",
        25: "Low Power Clean"
      };

      // RESET CONSUMABLE ALARMS
      this.updateCapabilityValue("alarm_main_brush_work_time", false);
      this.updateCapabilityValue("alarm_side_brush_work_time", false);
      this.updateCapabilityValue("alarm_filter_time_remaining", false);
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
      this.homey.flow.getDeviceTriggerCard('alertVacuum');
      this.homey.flow.getDeviceTriggerCard('statusVacuum');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            if (value) {
              return await this.miio.call("action", this.deviceProperties.set_properties.start_clean, { retries: 1 });
            } else {
              return await this.miio.call("action", this.deviceProperties.set_properties.stop_clean, { retries: 1 });
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
              case "spot_cleaning":
                return await this.triggerCapabilityListener('onoff', true);
              case "docked":
              case "charging":
                return await this.miio.call("action", this.deviceProperties.set_properties.home, { retries: 1 });
              case "stopped":
                return await this.triggerCapabilityListener('onoff', false);
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

      /* vacuumcleaner roidmi fanspeed */
      this.registerCapabilityListener('vacuum_roidmi_fanspeed', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.fanspeed.siid, piid: this.deviceProperties.set_properties.fanspeed.piid, value: Number(value) }], { retries: 1 });
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

      /* vacuumcleaner roidmi mop mode */
      this.registerCapabilityListener('vacuum_roidmi_mop_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: this.deviceProperties.set_properties.mopmode.siid, piid: this.deviceProperties.set_properties.mopmode.piid, value: Number(value) }], { retries: 1 });
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
      const device_status = result.find(obj => obj.did === 'device_status');
      const battery = result.find(obj => obj.did === 'battery');
      const fan_speed = result.find(obj => obj.did === 'fan_speed');
      const mop_mode = result.find(obj => obj.did === 'sweep_type');
      const water_level = result.find(obj => obj.did === 'water_level');
      const main_brush_time_remaining = result.find(obj => obj.did === 'main_brush_time_remaining');
      const side_brush_time_remaining = result.find(obj => obj.did === 'side_brush_time_remaining');
      const filter_time_remaining = result.find(obj => obj.did === 'filter_time_remaining');
      const sensor_time_remaining = result.find(obj => obj.did === 'sensor_time_remaining');
      const total_clean_time = result.find(obj => obj.did === 'total_clean_time');
      const total_clean_count = result.find(obj => obj.did === 'total_clean_count');
      const total_clean_area = result.find(obj => obj.did === 'total_clean_area');
      const device_fault = result.find(obj => obj.did === 'device_fault');

      const consumables = [
        {
          "main_brush_work_time": main_brush_time_remaining.value,
          "side_brush_work_time": side_brush_time_remaining.value,
          "filter_work_time": filter_time_remaining.value,
          "sensor_dirty_time": sensor_time_remaining.value,
        }
      ]

      const totals = {
        "clean_time": total_clean_time.value,
        "clean_count": total_clean_count.value,
        "clean_area": total_clean_area.value,
      }

      /* onoff & vacuumcleaner_state */
      switch (device_status.value) {
        case 4:
        case 5:
        case 8:
          this.vacuumCleanerState("cleaning");
          break;
        case 1:
        case 2:
        case 3:
        case 10:
        case 11:
          this.vacuumCleanerState("stopped");
          break;
        case 6:
          if (this.getCapabilityValue('measure_battery') === 100) {
            this.vacuumCleanerState("docked");
          } else {
            this.vacuumCleanerState("charging");
          }
          break;
        case 9:
          this.vacuumCleanerState("docked");
          break;
        case 7:
          this.vacuumCleanerState("stopped_error");
          break;
        default:
          this.log("Not a valid vacuumcleaner_state", state);
          break;
      }

      /* measure_battery & alarm_battery */
      await this.updateCapabilityValue("measure_battery", battery.value);
      await this.updateCapabilityValue("alarm_battery", battery.value <= 20 ? true : false);

      /* vacuum_roidmi_fanspeed */
      await this.updateCapabilityValue("vacuum_roidmi_fanspeed", fan_speed.value.toString());

      /* vacuum_roidmi_mop_mode */
      await this.updateCapabilityValue("vacuum_roidmi_mop_mode", mop_mode.value.toString());

      /* vacuum_roidmi_waterlevel */
      await this.updateCapabilityValue("vacuum_roidmi_waterlevel", water_level.value.toString());

      /* consumable settings */
      this.vacuumConsumables(consumables);

      /* totals */
      this.vacuumTotals(totals);

      /* settings device error */
      const error = this.errorCodes[device_fault.value];
      if (this.getSetting('error') !== error ) {
        await this.setSettings({ error: error });
        if (error !== 0) {
          await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": error }).catch(error => { this.error(error) });
        }
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

module.exports = RoidmiMiotDevice;