const Homey = require("homey");
const model = ["plug"];

class MiPlug extends Homey.Driver {
  onInit() {
    this.triggers = {
      inUse: new Homey.FlowCardTriggerDevice("inUse").register()
    };
    this.conditions = {
      inUse: new Homey.FlowCardCondition("inUse").register()
    };
  }

  onPairListDevices(data, callback) {
    if (Homey.app.mihub.hubs) {
      Homey.app.mihub
        .getDevicesByModel(model)
        .then(devices =>
          callback(
            null,
            devices.map(device => {
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
            })
          )
        )
        .catch(() => callback(new Error(Homey.__("pair.no_devices_found"))));
    } else {
      callback(new Error(Homey.__("pair.no_gateways")));
    }
  }
}

module.exports = MiPlug;
