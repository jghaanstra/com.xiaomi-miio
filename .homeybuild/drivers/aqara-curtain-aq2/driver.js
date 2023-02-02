const Homey = require("homey");
const model = ["curtain.aq2"];

class AqaraCurtainAQ2 extends Homey.Driver {
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

module.exports = AqaraCurtainAQ2;
