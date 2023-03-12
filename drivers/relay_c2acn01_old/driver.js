const Homey = require("homey");
const miio = require("miio");
const model = 54;

class Aqara2ChannelRelay extends Homey.Driver {

  async onInit() {

    this.homey.flow.getDeviceTriggerCard('rightSwitchOn');
    this.homey.flow.getDeviceTriggerCard('rightSwitchOff');

    this.config = {
      model: ["lumi.relay.c2acn01", "relay.c2acn01"]
    }
  }

  onPair(session) {
    let pairingDevice = {
      name: "Aqara Relay 2 Channel",
      settings: {},
      data: {}
    };

    function stripLumiFromId(id) {
      if (id.indexOf("lumi.") === 0) {
        return id.substring(5);
      }
      return id;
    }

    session.setHandler('getGatewaysList', async () => {
      try {
        const gatewaysList = (await this.homey.settings.get("gatewaysList")) || [];
        return Promise.resolve(gatewaysList);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('getDevices', async () => {
      try {
        let device = await miio.device({ address: pairingDevice.settings.deviceIp, token: pairingDevice.settings.deviceToken });
        let result = await device.call("get_device_prop", ["lumi.0", "device_list"]);
        const devices = [];

        for (let i = 0; i < result.length; i += 5) {
          const sid = stripLumiFromId(result[i]);
          const type = result[i + 1];
          const online = result[i + 2] === 1;

          if (sid === "0" || type != model) continue;

          devices.push({
            sid: "lumi." + sid,
            model: "LLZMK11LM",
            modelName: "lumi.relay.c2acn01",
            online
          });
        }
        return Promise.resolve(devices);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('getDevice', async () => {
      try {
        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('selectedGateway', async ({device}) => {
      try {
        pairingDevice.settings.deviceIp = device.ip;
        pairingDevice.settings.deviceToken = device.token;
        pairingDevice.settings.deviceFromGatewaySid = device.mac;
        pairingDevice.settings.password = device.password;
        pairingDevice.settings.updateTimer = 60;

        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('selectedDevice', async ({device}) => {
      try {
        pairingDevice.data.sid = device.sid;
        pairingDevice.settings.deviceSid = device.sid;
        pairingDevice.settings.deviceModelName = device.modelName;
        pairingDevice.settings.deviceModelCodeName = device.model;

        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('saveSettings', async ({device}) => {
      try {
        pairingDevice.name = device.name;
        pairingDevice.settings.updateTimer = parseInt(device.settings.updateTimer);

        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

    session.setHandler('allmostDone', async () => {
      try {
        return Promise.resolve(pairingDevice);
      } catch (error) {
        this.error(error);
        return Promise.reject(error);
      }
    });

  }
}

module.exports = Aqara2ChannelRelay;
