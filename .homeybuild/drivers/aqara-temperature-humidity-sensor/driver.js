const Homey = require("homey");
const model = ["weather.v1"];

class AqaraTemperatureHumiditySensor extends Homey.Driver {
  onInit() {
    this.conditions = {
      measure_temperature_between: new Homey.FlowCardCondition("measure_temperature_between").register(),
      measure_humidity_between: new Homey.FlowCardCondition("measure_humidity_between").register()
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

module.exports = AqaraTemperatureHumiditySensor;
