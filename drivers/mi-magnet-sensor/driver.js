'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class MiMagnetSensor extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});
    
    this.config = {
      model: ["magnet"]
    }
  }
  
}

module.exports = MiMagnetSensor;