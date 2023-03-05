'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class MiAqaraCube extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('shake_air_cube');
    this.homey.flow.getDeviceTriggerCard('tap_twice_cube');
    this.homey.flow.getDeviceTriggerCard('move_cube');
    this.homey.flow.getDeviceTriggerCard('flip180_cube');
    this.homey.flow.getDeviceTriggerCard('flip90_cube');
    this.homey.flow.getDeviceTriggerCard('free_fall_cube');
    this.homey.flow.getDeviceTriggerCard('alert_cube');
    this.homey.flow.getDeviceTriggerCard('cubeRotated');
    this.homey.flow.getDeviceTriggerCard('rotate_positive_cube');
    this.homey.flow.getDeviceTriggerCard('rotate_negative_cube');

    this.config = {
      model: ["cube", "sensor_cube.aqgl01", "sensor_cube"]
    }
  }

}

module.exports = MiAqaraCube;