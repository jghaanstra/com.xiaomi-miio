'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraButtonAdvanced extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('click_single');
    this.homey.flow.getDeviceTriggerCard('click_double');
    this.homey.flow.getDeviceTriggerCard('click_long');
    this.homey.flow.getDeviceTriggerCard('click_long_release');
    this.homey.flow.getDeviceTriggerCard('shake');

    this.config = {
      model: ["sensor_switch.aq3"]
    }
  }

}

module.exports = AqaraButtonAdvanced;