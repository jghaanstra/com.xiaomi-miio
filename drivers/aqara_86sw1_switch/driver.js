'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraWireless86SW1SwitchDriver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('click_single');

    this.config = {
      model: ["86sw1", "lumi.remote.b186acn02", "remote.b186acn02"]
    }
  }

}

module.exports = AqaraWireless86SW1SwitchDriver;