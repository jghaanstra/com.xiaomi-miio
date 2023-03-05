'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraMotionSensor extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion120');
    this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion180');
    this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion300');
    this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion600');
    this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion1200');
    this.homey.flow.getDeviceTriggerCard('motionSensorNoMotion1800');

    this.config = {
      model: ["sensor_motion.aq2"]
    }
    
  }

}

module.exports = AqaraMotionSensor;