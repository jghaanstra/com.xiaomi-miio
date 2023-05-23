'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/mijia.vacuum.v1
// https://home.miot-spec.com/spec/mijia.vacuum.v2

const mapping = {
  "mijia.vacuum.v1": "properties_default",
  "mijia.vacuum.v2": "properties_default",
  "mijia.vacuum.*": "properties_default",
};

const properties = {
  "properties_default": {
    "get_properties": [
      { did: "battery", siid: 3, piid: 1 }, // measure_battery
      { did: "charge_state", siid: 3, piid: 2 },
      { did: "device_fault", siid : 2, piid: 2 }, // settings.error
      { did: "device_status", siid: 2, piid: 1 }, // vacuumcleaner_state
      { did: "operating_mode", siid: 2, piid: 4 }, // 1 = whole, 2 = spot, 3 = perimeter
      { did: "main_brush_life_level", siid: 24, piid: 2 }, // settings.main_brush_work_time
      { did: "side_brush_life_level", siid: 25, piid: 1 }, // settings.side_brush_work_time
      { did: "filter_life_level", siid: 11, piid: 1 }, // settings.filter_work_time
      { did: "fan_speed", siid: 2, piid: 6 }, // vacuum_dreame_fanspeed
      { did: "total_clean_time", siid: 9, piid: 4 }, // settings.total_work_time
      { did: "total_clean_count", siid: 9, piid: 5 }, // settings.clean_count
      { did: "total_clean_area", siid: 9, piid: 3 } // settings.total_cleared_area
    ],
    "set_properties": {
      "start_clean": { siid: 2, aiid: 1, did: "call-2-1", in: [] },
      "stop_clean": { siid: 2, aiid: 2, did: "call-2-2", in: [] },
      "find": { siid: 6, aiid: 1, did: "call-6-1", in: [] },
      "home": { siid: 2, aiid: 3, did: "call-2-3", in: [] },
      "fanspeed": { siid: 2, piid: 6 }
    }
  }
}

class AdvancedMijaMiotDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE VARIABLES
      this.deviceProperties = properties[mapping[this.getStoreValue('model')]] !== undefined ? properties[mapping[this.getStoreValue('model')]] : properties[mapping[this.getStoreValue('mijia.vacuum.*')]];

      this.vacuumErrorCodes = {
        0: "No Error",
        1: "Left-wheel-error",
        2: "Right-wheel-error",
        3: "Cliff-error",
        4: "Low-battery-error",
        5: "Bump-error",
        6: "Main-brush-error",
        7: "Side-brush-error",
        8: "Fan-motor-error",
        9: "Dustbin-error",
        10: "Charging-error",
        11: "No-water-error",
        0: "Everything-is-ok",
        12: "Pick-up-error"
      }

      // RESET CONSUMABLE ALARMS
      this.updateCapabilityValue("alarm_main_brush_work_time", false);
      this.updateCapabilityValue("alarm_side_brush_work_time", false);
      this.updateCapabilityValue("alarm_filter_work_time", false);

      // DEVICE TOKENS
      this.main_brush_lifetime_token = await this.homey.flow.createToken("main_brush_lifetime"+ this.getData().id, {type: "number", title: "Main Brush Lifetime " + this.getName() +" (%)" });
      this.side_brush_lifetime_token = await this.homey.flow.createToken("side_brush_lifetime"+ this.getData().id, {type: "number", title: "Side Brush Lifetime " + this.getName() +" (%)" });
      this.filter_lifetime_token = await this.homey.flow.createToken("filter_lifetime"+ this.getData().id, {type: "number", title: "Filter LifeTime " + this.getName() +" (%)" });
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

      /* vacuumcleaner dreame fanspeed */
      this.registerCapabilityListener('vacuum_dreame_fanspeed', async ( value ) => {
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
      const main_brush_life_level = result.find(obj => obj.did === 'main_brush_life_level');
      const side_brush_life_level = result.find(obj => obj.did === 'side_brush_life_level');
      const filter_life_level = result.find(obj => obj.did === 'filter_life_level');
      const total_clean_time = result.find(obj => obj.did === 'total_clean_time');
      const total_clean_count = result.find(obj => obj.did === 'total_clean_count');
      const total_clean_area = result.find(obj => obj.did === 'total_clean_area');
      const device_fault = result.find(obj => obj.did === 'device_fault');

      const consumables = [
        {
          "main_brush_work_time": main_brush_life_level.value,
          "side_brush_work_time": side_brush_life_level.value,
          "filter_work_time": filter_life_level.value,
        }
      ]

      const totals = {
        "clean_time": total_clean_time.value,
        "clean_count": total_clean_count.value,
        "clean_area": total_clean_area.value,
      }

      /* onoff & vacuumcleaner_state */
      switch (device_status.value) {
        case 2:
        case 6:
          this.vacuumCleanerState("cleaning");
          break;
        case 3:
          this.vacuumCleanerState("stopped");
          break;
        case 1:
          if (this.getCapabilityValue('measure_battery') === 100) {
            this.vacuumCleanerState("docked");
          } else {
            this.vacuumCleanerState("stopped");
          }
          break;
        case 5:
          if (this.getCapabilityValue('measure_battery') === 100) {
            this.vacuumCleanerState("docked");
          } else {
            this.vacuumCleanerState("charging");
          }
          break;
        case 4:
          this.vacuumCleanerState("stopped_error");
          break;
        default:
          this.log("Not a valid vacuumcleaner_state", state);
          break;
      }

      /* measure_battery & alarm_battery */
      await this.updateCapabilityValue("measure_battery", battery.value);
      await this.updateCapabilityValue("alarm_battery", battery_level.value <= 20 ? true : false);

      /* vacuum_dreame_fanspeed */
      await this.updateCapabilityValue("vacuum_dreame_fanspeed", fan_speed.value.toString());

      /* consumable settings */
      this.vacuumConsumables(consumables);

      /* totals */
      this.vacuumTotals(totals);

      /* settings device error */
      const error = this.vacuumErrorCodes[device_fault.value];
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

module.exports = AdvancedMijaMiotDevice;