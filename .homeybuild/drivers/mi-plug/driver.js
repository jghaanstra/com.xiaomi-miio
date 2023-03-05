'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class MiPlug extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ['plug']
    }

    this.homey.flow.getDeviceTriggerCard('triggerPlugInUse');
  }

}

module.exports = MiPlug;
