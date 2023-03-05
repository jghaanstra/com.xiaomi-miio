'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraWallOutletDriver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["ctrl_86plug.aq1", "lumi.ctrl_86plug.aq1", "lumi.ctrl_86plug"]
    }
    
  }
}

module.exports = AqaraWallOutletDriver;