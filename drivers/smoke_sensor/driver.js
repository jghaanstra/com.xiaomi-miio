'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class SmokeSensorDriver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["smoke", "sensor_smoke"]
    }
  }

}

module.exports = SmokeSensorDriver;