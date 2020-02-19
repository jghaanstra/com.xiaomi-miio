const Homey = require("homey");
const model = ["remote.b286acn01"];

class AqaraWirellesSwitch extends Homey.Driver {
  onInit() {
    this.triggers = {
      switch_left_click: new Homey.FlowCardTriggerDevice("switch_left_click").register(),
      switch_left_double_click: new Homey.FlowCardTriggerDevice("switch_left_double_click").register(),
      switch_left_long_click: new Homey.FlowCardTriggerDevice("switch_left_long_click").register(),
      switch_right_click: new Homey.FlowCardTriggerDevice("switch_right_click").register(),
      switch_right_double_click: new Homey.FlowCardTriggerDevice("switch_right_double_click").register(),
      switch_right_long_click: new Homey.FlowCardTriggerDevice("switch_right_long_click").register(),
      switch_both_click: new Homey.FlowCardTriggerDevice("switch_both_click").register()
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

module.exports = AqaraWirellesSwitch;
