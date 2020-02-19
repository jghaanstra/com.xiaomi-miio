const Homey = require("homey");

class AqaraSwitch extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.onEventFromGateway = this.onEventFromGateway.bind(this);
    this.data = this.getData();
    this.initialize();
    this.log("[Xiaomi Mi Home] Device init - name: " + this.getName() + " - class: " + this.getClass() + " - data: " + JSON.stringify(this.data));
  }

  async initialize() {
    if (Homey.app.gatewaysList.length > 0) {
      this.registerStateChangeListener();
      this.registerCapabilities();
      this.registerConditions();
      this.registerActions();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  registerCapabilities() {
    this.registerToggleLeftChannel("onoff");
    this.registerToggleRightChannel("onoff.1");
  }

  registerConditions() {
    const { conditions } = this.getDriver();
    this.registerCondition(conditions.rightSwitch);
  }

  registerActions() {
    const { actions } = this.getDriver();
    this.registerSwitchOnAction("onoff.1", actions.rightSwitchOn);
    this.registerSwitchOffAction("onoff.1", actions.rightSwitchOff);
    this.registerToggleAction("onoff.1", actions.rightSwitchToggle);
  }

  onEventFromGateway(device) {
    const { triggers } = this.getDriver();
    const data = JSON.parse(device["data"]);

    if (data["channel_0"]) {
      this.updateCapabilityValue("onoff", data["channel_0"] == "on" ? true : false);
    }

    if (data["channel_1"]) {
      this.updateCapabilityValue("onoff.1", data["channel_1"] == "on" ? true : false);

      if (data["channel_1"] == "on") {
        triggers.rightSwitchOn.trigger(this, {}, true);
      } else if (data["channel_1"] == "off") {
        triggers.rightSwitchOff.trigger(this, {}, true);
      }
    }

    this.setSettings({
      gatewaySid: Object.values(Homey.app.mihub.getDevices()).filter(deviceObj => deviceObj.sid == device.sid)[0].gatewaySid
    });
  }

  updateCapabilityValue(name, value) {
    if (this.getCapabilityValue(name) != value) {
      this.setCapabilityValue(name, value)
        .then(() => this.log("[" + this.getName() + "] [" + this.data.sid + "] [" + name + "] [" + value + "] Capability successfully updated"))
        .catch(error => this.log("[" + this.getName() + "] [" + this.data.sid + "] [" + name + "] [" + value + "] Capability not updated because there are errors: " + error.message));
    }
  }

  registerToggleLeftChannel(name) {
    const sid = this.data.sid;
    this.registerCapabilityListener(name, async value => {
      const model = Homey.app.mihub.getDeviceModelBySid(sid);
      let command = '{"cmd":"write","model":"' + model + '","sid":"' + sid + '","data":{"channel_0":"' + (value ? "on" : "off") + '", "key": "${key}"}}';

      return await Homey.app.mihub.sendWriteCommand(sid, command);
    });
  }

  registerToggleRightChannel(name) {
    const sid = this.data.sid;
    this.registerCapabilityListener(name, async value => {
      const model = Homey.app.mihub.getDeviceModelBySid(sid);
      let command = '{"cmd":"write","model":"' + model + '","sid":"' + sid + '","data":{"channel_1":"' + (value ? "on" : "off") + '", "key": "${key}"}}';

      return await Homey.app.mihub.sendWriteCommand(sid, command);
    });
  }

  registerCondition(condition) {
    condition.registerRunListener((args, state) => Promise.resolve(args.device.getCapabilityValue("onoff.1")));
  }

  registerSwitchOnAction(name, action) {
    action.registerRunListener(async (args, state) => {
      const sid = args.device.data.sid;
      const model = Homey.app.mihub.getDeviceModelBySid(sid);
      let command = '{"cmd":"write","model":"' + model + '","sid":"' + sid + '","data":{"channel_1": "on", "key": "${key}"}}';

      return await Homey.app.mihub.sendWriteCommand(sid, command);
    });
  }

  registerSwitchOffAction(name, action) {
    action.registerRunListener(async (args, state) => {
      const sid = args.device.data.sid;
      const model = Homey.app.mihub.getDeviceModelBySid(sid);
      let command = '{"cmd":"write","model":"' + model + '","sid":"' + sid + '","data":{"channel_1": "off", "key": "${key}"}}';

      return await Homey.app.mihub.sendWriteCommand(sid, command);
    });
  }

  registerToggleAction(name, action) {
    action.registerRunListener(async (args, state) => {
      const sid = args.device.data.sid;
      const model = Homey.app.mihub.getDeviceModelBySid(sid);
      let command = '{"cmd":"write","model":"' + model + '","sid":"' + sid + '","data":{"channel_1":"' + (args.device.getCapabilityValue("onoff.1") ? "off" : "on") + '", "key": "${key}"}}';

      return await Homey.app.mihub.sendWriteCommand(sid, command);
    });
  }

  registerStateChangeListener() {
    Homey.app.mihub.on(this.data.sid, this.onEventFromGateway);
  }

  unregisterStateChangeListener() {
    Homey.app.mihub.removeListener(this.data.sid, this.onEventFromGateway);
  }

  onAdded() {
    this.log("[Xiaomi Mi Home] " + this.getName() + " device added");
  }

  onDeleted() {
    this.unregisterStateChangeListener();
    this.log("[Xiaomi Mi Home] " + this.getName() + " device deleted!");
  }
}

module.exports = AqaraSwitch;
