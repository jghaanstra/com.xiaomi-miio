const Homey = require("homey");
const model = ["ctrl_ln2.aq1", "switch_b2nacn02"];

class AqaraSwitch extends Homey.Driver {
  onInit() {
    this.triggers = {
      rightSwitchOn: new Homey.FlowCardTriggerDevice("rightSwitchOn").register(),
      rightSwitchOff: new Homey.FlowCardTriggerDevice("rightSwitchOff").register()
    };
    this.conditions = {
      rightSwitch: new Homey.FlowCardCondition("rightSwitch").register()
    };
    this.actions = {
      rightSwitchOn: new Homey.FlowCardAction("rightSwitchOn").register(),
      rightSwitchOff: new Homey.FlowCardAction("rightSwitchOff").register(),
      rightSwitchToggle: new Homey.FlowCardAction("rightSwitchToggle").register()
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

module.exports = AqaraSwitch;
