const Homey = require("homey");
const model = ["cube", "sensor_cube.aqgl01", "sensor_cube"];

class MiAqaraCube extends Homey.Driver {
  onInit() {
    this.triggers = {
      shake_air: new Homey.FlowCardTriggerDevice("shake_air_cube").register(),
      tap_twice: new Homey.FlowCardTriggerDevice("tap_twice_cube").register(),
      move: new Homey.FlowCardTriggerDevice("move_cube").register(),
      flip180: new Homey.FlowCardTriggerDevice("flip180_cube").register(),
      flip90: new Homey.FlowCardTriggerDevice("flip90_cube").register(),
      free_fall: new Homey.FlowCardTriggerDevice("free_fall_cube").register(),
      alert: new Homey.FlowCardTriggerDevice("alert_cube").register(),
      rotatePositive: new Homey.FlowCardTriggerDevice("rotate_positive_cube").register(),
      rotateNegative: new Homey.FlowCardTriggerDevice("rotate_negative_cube").register(),
      cubeRotated: new Homey.FlowCardTriggerDevice("cubeRotated").register()
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

module.exports = MiAqaraCube;
