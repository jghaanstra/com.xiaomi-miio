const Homey = require("homey");
const model = ["sensor_motion.aq2"];

class AqaraMotionSensor extends Homey.Driver {
  onInit() {
    this.triggers = {
      motionSensorNoMotion120: new Homey.FlowCardTriggerDevice("motionSensorNoMotion120").register(),
      motionSensorNoMotion180: new Homey.FlowCardTriggerDevice("motionSensorNoMotion180").register(),
      motionSensorNoMotion300: new Homey.FlowCardTriggerDevice("motionSensorNoMotion300").register(),
      motionSensorNoMotion600: new Homey.FlowCardTriggerDevice("motionSensorNoMotion600").register(),
      motionSensorNoMotion1200: new Homey.FlowCardTriggerDevice("motionSensorNoMotion1200").register(),
      motionSensorNoMotion1800: new Homey.FlowCardTriggerDevice("motionSensorNoMotion1800").register()
    };
  }

  onPairListDevices(data, callback) {
    if (Homey.app.gatewaysList.length > 0) {
      Homey.app.mihub
        .getDevicesByModel(model)
        .then(devices =>
          callback(
            null,
            devices.map(device => {
              return {
                name: device.modelInfo.name + " | " + device.sid,
                data: {
                  sid: device.sid
                },
                settings: {
                  deviceSid: device.sid,
                  gatewaySid: device.gatewaySid,
                  model: device.model,
                  modelCode: device.modelInfo.modelCode
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

module.exports = AqaraMotionSensor;
