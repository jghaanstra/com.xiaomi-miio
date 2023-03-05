'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraMagnetSensor extends Driver {

  async onInit() {
    
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["sensor_magnet.aq2"]
    }

  }
  
}

module.exports = AqaraMagnetSensor;