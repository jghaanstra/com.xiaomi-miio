'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraNeutral2Switch extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('rightSwitchOn');
    this.homey.flow.getDeviceTriggerCard('rightSwitchOff');

    this.config = {
      model: ["ctrl_neutral2", "switch_b2lacn02"]
    }
    
  }

}

module.exports = AqaraNeutral2Switch;