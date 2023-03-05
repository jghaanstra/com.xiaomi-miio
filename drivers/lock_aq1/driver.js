'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class LockAQ1Driver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('lockEvent');

    this.config = {
      model: ["lock.aq1"]
    }
  }

}

module.exports = LockAQ1Driver;