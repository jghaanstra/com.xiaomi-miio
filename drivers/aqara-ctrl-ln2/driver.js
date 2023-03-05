'use strict';

const Driver = require('../subdevice_driver.js');
const Util = require('../../lib/util.js');

class AqaraSwitch extends Driver {

  async onInit() {

    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('rightSwitchOn');
    this.homey.flow.getDeviceTriggerCard('rightSwitchOff');

    this.config = {
      model: ["ctrl_ln2.aq1", "switch_b2nacn02"]
    }
    
  }

}

module.exports = AqaraSwitch;