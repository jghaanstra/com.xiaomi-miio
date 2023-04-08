'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraCtrlLn1SwitchDriver extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      model: ["ctrl_ln1.aq1", "switch_b1nacn02"]
    }
    
  }

}

module.exports = AqaraCtrlLn1SwitchDriver;