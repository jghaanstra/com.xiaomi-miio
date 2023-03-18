'use strict';

const Homey = require('homey');
const Util = require('../lib/util.js');

class MiHomeSubDeviceDriver extends Homey.Driver {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});
  }

  onPair(session) {

    session.setHandler('list_devices', async (data) => {
      try {
        if (this.homey.app.mihub.hubs) {
          const discoverDevices = await this.homey.app.mihub.getDevicesByModel(this.config.model);

          return discoverDevices.map(device => {
            return {
              name: device.name + " | " + device.sid,
              data: {
                sid: device.sid
              },
              settings: {
                deviceSid: device.sid,
                model: device.model,
                modelCode: device.modelCode
              }
            };
          });
        } else {
          return Promise.reject(this.homey.__("pair.no_gateways"));
        }
      } catch (error) {
        this.error(error);
        return Promise.reject(this.homey.__("pair.no_devices_found"));
      }
    });

  }

}

module.exports = MiHomeSubDeviceDriver;