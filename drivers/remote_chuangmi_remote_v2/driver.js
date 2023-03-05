'use strict';

const Driver = require('../wifi_driver.js');
const miio = require('miio');

class IRRemoteDriver extends Driver {

  onPair(session) {

    let pairingDevice = {
      name: "Unknown",
      settings: {},
      data: {},
      capabilities: [],
      capabilitiesOptions: {}
    };

    let type = "other";

    session.setHandler('getCurrentDevice', async (data) => {
      try {
        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('getCurrentDeviceForCharacteristics', async (data) => {
      try {
        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('getDevicesList', async (data) => {
      try {
        const devices = await this.homey.settings.get("irDevicesList");
        return Promise.resolve(devices || []);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('newCharacteristics', async (data) => {
      try {
        pairingDevice = data;

        if (pairingDevice.capabilitiesOptions && pairingDevice.capabilitiesOptions.dim) {
          pairingDevice.capabilitiesOptions.dim.max = parseInt(data.characteristicsSettings.dim);
        }

        return Promise.resolve(pairingDevice.capabilitiesOptions);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('learnCode', async (data) => {
      try {
        this.timekey = "123456789012345";
        this.data = data;

        const device = await miio.device({ address: data.ip, token: data.token });
        const ir_learn = await device.call("miIO.ir_learn", { key: this.timekey });

        setTimeout(async () => {
          const ir_read = await device.call("miIO.ir_read", { key: this.timekey });

          if (ir_read["code"] !== "") {
            let value = { code: ir_read["code"] };
            pairingDevice.data[data.key] = ir_read["code"];
            return Promise.resolve(value);
          } else {
            return Promise.reject("timeout");
          }
        }, 5000);


      } catch (error) {
        this.error(error);
        if (error == "Error: Could not connect to device, handshake timeout") {
          return Promise.reject("offline");
        } else {
          return Promise.reject(error);
        }
      }
    });

    session.setHandler('selectedType', async (data) => {
      try {
        type = data.type;
        pairingDevice.name = data.name;
        pairingDevice.icon = data.type + ".svg";
        pairingDevice.capabilities = data.capabilities;
        pairingDevice.capabilitiesOptions = data.capabilitiesOptions;
        pairingDevice.characteristicsSettings = data.characteristicsSettings;

        return Promise.resolve(type);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('selectedDevice', async (data) => {
      try {
        pairingDevice.settings.deviceIp = data.devices.ip;
        pairingDevice.settings.deviceToken = data.devices.token;
        pairingDevice.data.id =
          pairingDevice.name +
          "-" +
          data.devices.ip +
          "-" +
          Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);

        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('allmostDone', async (data) => {
      try {
        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

  }

}

module.exports = IRRemoteDriver;