'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraCurtain extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["curtain", "curtain.hagl04"]
    }
    
  }

}

module.exports = AqaraCurtain;