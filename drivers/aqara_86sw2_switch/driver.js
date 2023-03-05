'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraWireless86SW2SwitchDriver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('click_single_left');
    this.homey.flow.getDeviceTriggerCard('click_single_right');
    this.homey.flow.getDeviceTriggerCard('click_single_left_right');

    this.config = {
      model: ["86sw2"]
    }
    
  }

}

module.exports = AqaraWireless86SW2SwitchDriver;