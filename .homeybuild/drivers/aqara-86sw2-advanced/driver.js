'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraWirellesSwitch extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('click_single_left');
    this.homey.flow.getDeviceTriggerCard('click_double_left');
    this.homey.flow.getDeviceTriggerCard('click_long_left');
    this.homey.flow.getDeviceTriggerCard('click_single_right');
    this.homey.flow.getDeviceTriggerCard('click_double_right');
    this.homey.flow.getDeviceTriggerCard('click_long_right');
    this.homey.flow.getDeviceTriggerCard('click_single_left_right');

    this.config = {
      model: ["remote.b286acn01", "lumi.remote.b286acn02", "remote.b286acn02"]
    }
    
  }

}

module.exports = AqaraWirellesSwitch;