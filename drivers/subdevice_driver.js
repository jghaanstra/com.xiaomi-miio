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
          const name = await this.util.getFriendlyNameSubdevice(this.config.model[0]) || 'Unknown model';

          return discoverDevices.map(device => {
            return {
              name: name + " | " + device.sid,
              data: {
                sid: device.sid
              },
              settings: {
                deviceSid: device.sid,
                gatewaySid: device.gatewaySid,
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