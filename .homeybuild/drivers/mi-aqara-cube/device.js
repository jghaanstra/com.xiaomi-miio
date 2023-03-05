'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class MiAqaraCube extends Device {

  async onEventFromGateway(device) {
    try {

      /* measure_battery & alarm_battery */
      if (device && device.data && device.data["voltage"]) {
        const battery = (device.data["voltage"] - 2800) / 5;
        await this.updateCapabilityValue("measure_battery", this.util.clamp(battery, 0, 100));
        await this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
      }
  
      /* cube events */
      if (device && device.data && device.data["status"] === "shake_air") { await this.homey.flow.getDeviceTriggerCard('shake_air_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "tap_twice") { await this.homey.flow.getDeviceTriggerCard('tap_twice_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "move") { await this.homey.flow.getDeviceTriggerCard('move_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "flip180") { await this.homey.flow.getDeviceTriggerCard('flip180_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "flip90") { await this.homey.flow.getDeviceTriggerCard('flip90_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "free_fall") { await this.homey.flow.getDeviceTriggerCard('free_fall_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["status"] === "alert") { await this.homey.flow.getDeviceTriggerCard('alert_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && device.data["rotate"]) { await this.homey.flow.getDeviceTriggerCard('cubeRotated').trigger(this, {cube_rotated: parseInt(device.data["rotate"])}).catch(error => { this.error(error) }); }
      if (device && device.data && parseInt(device.data["rotate"]) > 0) { await this.homey.flow.getDeviceTriggerCard('rotate_positive_cube').trigger(this).catch(error => { this.error(error) }); }
      if (device && device.data && parseInt(device.data["rotate"]) < 0) { await this.homey.flow.getDeviceTriggerCard('rotate_negative_cube').trigger(this).catch(error => { this.error(error) }); }

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiAqaraCube;