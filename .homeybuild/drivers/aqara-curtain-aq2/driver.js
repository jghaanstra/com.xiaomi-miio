'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraCurtainAQ2 extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["curtain.aq2"]
    }
    
  }

}

module.exports = AqaraCurtainAQ2;