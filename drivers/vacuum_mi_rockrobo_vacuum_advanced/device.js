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

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('statusVacuum');
      this.homey.flow.getDeviceTriggerCard('alertVacuum');

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
      if (this.getSetting('rooms') !== rooms ) {
        await this.setSettings({ rooms: rooms.toString() });
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
