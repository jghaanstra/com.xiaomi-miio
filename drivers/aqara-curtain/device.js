'use strict';

const Homey = require('homey');
const Device = require('../subdevice_device.js');

class AqaraCurtain extends Device {

  async registerCapabilities() {
    this.registerCapabilityListener('onoff', async (value) => {
      try {
        const settings = this.getSettings();
        if (value) {
          const data = { curtain_status: settings.reverted ? "open" : "close" };
          return await this.homey.app.mihub.sendWrite(this.data.sid, data);
        } else {
          const data = { curtain_status: settings.reverted ? "close" : "open" };
          return await this.homey.app.mihub.sendWrite(this.data.sid, data);
        }
      } catch (error) {
        this.error(error);
      }
    });
    this.registerCapabilityListener('dim', async (value) => {
      try {
        const level = Math.round(value * 100);
        const data = { curtain_level: level.toString() };
        return await this.homey.app.mihub.sendWrite(this.data.sid, data);
      } catch (error) {
        this.error(error);
      }
    });
    this.registerCapabilityListener('windowcoverings_state', async (value) => {
      try {
        const settings = this.getSettings();
        const states = { up: "open", idle: "stop", down: "close" };
        if (value == "up") {
          const data = { curtain_status: states[settings.inverted_mode ? "down" : "up"] };
          return await this.homey.app.mihub.sendWrite(this.data.sid, data);
        } else if (value == "down") {
          const data = { curtain_status: states[settings.inverted_mode ? "up" : "down"] };
          return await this.homey.app.mihub.sendWrite(this.data.sid, data);
        } else {
          const data = { curtain_status: states[value] };
          return await this.homey.app.mihub.sendWrite(this.data.sid, data);
        }
      } catch (error) {
        this.error(error);
      }
    });
  }

  async onEventFromGateway(device) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      /* onoff */
      if (parseInt(device.data.curtain_level) > 0) { await this.updateCapabilityValue("onoff", this.getSetting('inverted_state') ? false : true); }
      if (parseInt(device.data.curtain_level) == 0) { await this.updateCapabilityValue("onoff", this.getSetting('inverted_state') ? true : false); }
  
      /* dim (curtain_level) */
      if (device.data.curtain_level) { await this.updateCapabilityValue("dim", parseInt(device.data.curtain_level) / 100); }
      this.homey.clearTimeout(this.curtainTernaryTimeout);
      this.curtainTernaryTimeout = setTimeout(() => {
        this.setCapabilityValue("windowcoverings_state", "idle");
      }, 3000);

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = AqaraCurtain;