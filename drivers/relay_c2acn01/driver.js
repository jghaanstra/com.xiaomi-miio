'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class RelayC2ACN01Driver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('rightSwitchOn');
    this.homey.flow.getDeviceTriggerCard('rightSwitchOff');

    this.config = {
      model: ["relay.c2acn01"]
    }
  }

}

module.exports = RelayC2ACN01Driver;