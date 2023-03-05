'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraSwitch extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["ctrl_neutral1", "switch_b1lacn02"]
    }
    
  }
}

module.exports = AqaraSwitch;