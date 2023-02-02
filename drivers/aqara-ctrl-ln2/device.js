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
    if (Homey.app.mihub.hubs) {
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
    this.registerRightSwitchOnAction("onoff.1", actions.rightSwitchOn);
    this.registerRightSwitchOffAction("onoff.1", actions.rightSwitchOff);
    this.registerRightSwitchToggleAction("onoff.1", actions.rightSwitchToggle);
  }

  onEventFromGateway(device) {
    const { triggers } = this.getDriver();

    if (device && device.data && device.data["channel_0"]) {
      this.updateCapabilityValue("onoff", device.data["channel_0"] == "on" ? true : false);
    }

    if (device && device.data && device.data["channel_1"]) {
      this.updateCapabilityValue("onoff.1", device.data["channel_1"] == "on" ? true : false);

      if (device && device.data && device.data["channel_1"] == "on") {
        triggers.rightSwitchOn.trigger(this, {}, true);
      } else if (device && device.data && device.data["channel_1"] == "off") {
        triggers.rightSwitchOff.trigger(this, {}, true);
      }
    }

    let gateways = Homey.app.mihub.gateways;
    for (let sid in gateways) {
      gateways[sid]["childDevices"].forEach(deviceSid => {
        if (this.data.sid == deviceSid) {
          this.setSettings({
            gatewaySid: sid
          });
        }
      });
    }
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
      return await Homey.app.mihub.sendWrite(sid, { channel_0: value ? "on" : "off" });
    });
  }

  registerToggleRightChannel(name) {
    const sid = this.data.sid;
    this.registerCapabilityListener(name, async value => {
      return await Homey.app.mihub.sendWrite(sid, { channel_1: value ? "on" : "off" });
    });
  }

  registerCondition(condition) {
    condition.registerRunListener((args, state) => Promise.resolve(args.device.getCapabilityValue("onoff.1")));
  }

  registerRightSwitchOnAction(name, action) {
    action.registerRunListener(async (args, state) => {
      const sid = args.device.data.sid;
      return await Homey.app.mihub.sendWrite(sid, { channel_1: "on" });
    });
  }

  registerRightSwitchOffAction(name, action) {
    action.registerRunListener(async (args, state) => {
      const sid = args.device.data.sid;
      return await Homey.app.mihub.sendWrite(sid, { channel_1: "off" });
    });
  }

  registerRightSwitchToggleAction(name, action) {
    action.registerRunListener(async (args, state) => {
      const sid = args.device.data.sid;
      return await Homey.app.mihub.sendWrite(sid, { channel_1: "toggle" });
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
