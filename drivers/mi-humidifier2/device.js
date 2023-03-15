'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class MiHumidifier2Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});

      // TODO: remove this on the next official release
      if (this.hasCapability('measure_power')) { this.removeCapability('measure_power'); }
      if (!this.hasCapability('humidifier2_mode')) { this.addCapability('humidifier2_mode'); }
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel');
      this.homey.flow.getDeviceTriggerCard('triggerModeChanged');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

      this.registerCapabilityListener('humidifier2_mode', async (value) => {
        try {
          if (this.miio) {
            return await this.miio.setMode(value);
          } else {
            this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
            this.createDevice();
            return Promise.reject('Device unreachable, please try again ...');
          }
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

    } catch (error) {
      this.error(error);
    }
  }

  async handleDeviceSettings() {
    try {

      const result = await this.miio.call("get_prop", ["led_b", "buzzer", "child_lock"], { retries: 1 });
      if (!this.getAvailable()) { await this.setAvailable(); }

      await this.setSettings({ led: result[0].toString() });
      await this.setSettings({ buzzer: result[1] == "on" ? true : false });
      await this.setSettings({ childLock: result[2] == "on" ? true : false });

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.error(error.message);
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys.includes("address") || changedKeys.includes("token") || changedKeys.includes("polling")) {
      this.refreshDevice();
    }

    if (changedKeys.includes("led")) {
      const led = await this.miio.call("set_led_b", Number(newSettings.led), { retries: 1 });
    }

    if (changedKeys.includes("buzzer")) {
      const buzzer = await this.miio.call("set_buzzer", [newSettings.buzzer ? "on" : "off"], { retries: 1 });
    }

    if (changedKeys.includes("childLock")) {
      const childlock = await this.miio.call("set_child_lock", [newSettings.childLock ? "on" : "off"], { retries: 1 });
    }

    return Promise.resolve(true);

  }

}

module.exports = MiHumidifier2Device;
