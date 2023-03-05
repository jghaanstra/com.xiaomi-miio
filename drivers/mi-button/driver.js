'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class MiButton extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('click_single');
    this.homey.flow.getDeviceTriggerCard('click_double');
    this.homey.flow.getDeviceTriggerCard('click_long');

    this.config = {
      model: ["switch"]
    }
  }
  
}

module.exports = MiButton;