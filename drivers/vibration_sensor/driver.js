'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class VibrationSensorDriver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('triggerVibrationTiltAlarm');
    this.homey.flow.getDeviceTriggerCard('triggerVibrationFreeFallAlarm');

    this.config = {
      model: ["vibration"]
    }
  }

}

module.exports = VibrationSensorDriver;