'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

const params = [
  { siid: 2, piid: 1 },
  { siid: 2, piid: 2 },
  { siid: 3, piid: 1 },
];

const modes = {
  101: "Silent",
  102: "Basic",
  102: "Strong",
  103: "Full speed"
};

class MiRobotA08Device extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // FLOW TRIGGER CARDS
      this.homey.flow.getDeviceTriggerCard('statusVacuum');

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("action", { siid: 2, aiid: 1, did: "call-2-1", in: [] }, { retries: 1 });
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

      this.registerCapabilityListener('vacuum_roborock_a08_mode', async ( value ) => {
        try {
          if (this.miio) {
            return await this.miio.call("set_properties", [{ siid: 2, piid: 2, value: +value }], { retries: 1 });
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

  async retrieveDeviceData() {
    try {

      const result = await this.miio.call("get_properties", params, {retries: 1});
      if (!this.getAvailable()) { await this.setAvailable(); }

      const deviceStatusResult = result.filter((r) => r.siid == 2 && r.piid == 1)[0];
      const deviceModeResult = result.filter((r) => r.siid == 2 && r.piid == 2)[0];
      const batteryResult = result.filter((r) => r.siid == 3 && r.piid == 1)[0];

      if ([5, 7, 15, 16, 17, 18].includes(deviceStatusResult.value)) {
        this.updateCapabilityValue("onoff", true);
      } else if (deviceStatusResult.value == 2) {
        this.updateCapabilityValue("onoff", false);
      }

      await this.updateCapabilityValue("measure_battery", +batteryResult.value);
      await this.updateCapabilityValue("alarm_battery", +batteryResult.value <= 20 ? true : false);

      if (this.getCapabilityValue(vacuum_roborock_a08_mode) !== deviceModeResult.value.toString()) {
        await this.updateCapabilityValue("vacuum_roborock_a08_mode", deviceModeResult.value.toString);
        await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": modes[deviceModeResult.value] }).catch(error => { this.error(error) });
      }

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error.message);
    }
  }

}

module.exports = MiRobotA08Device;
