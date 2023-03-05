'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraWleakSensor extends Driver {

  async onInit() {
    
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["sensor_wleak.aq1"]
    }
  }
  
}

module.exports = AqaraWleakSensor;