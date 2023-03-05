'use strict';

const Homey = require('homey');
const miio = require('miio');
const Util = require('../lib/util.js');

class MiHomeWifiDriver extends Homey.Driver {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});
  }

  onPair(session) {

    let deviceObject = {};

    session.setHandler('test_connection', async (data) => {
      try {
        const device = await miio.device({ address: data.address, token: data.token });
        const model = await device.miioModel;
        const name = await this.util.getFriendlyNameWiFi(model) || 'Unknown model';
        const device_name = name + ' ('+ model +')';

        deviceObject = {
          name: device_name,
          data: {
            id: data.token
          },
          settings: {
            address: data.address,
            token: data.token,
            polling: data.polling
          },
          store: {
            model: model
          }
        }
        return Promise.resolve(deviceObject);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('add_device', async () => {
      try {
        return Promise.resolve(deviceObject);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

  }

}

module.exports = MiHomeWifiDriver;