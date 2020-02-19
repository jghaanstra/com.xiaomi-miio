const Homey = require("homey");

class MiPlug extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.onEventFromGateway = this.onEventFromGateway.bind(this);
    this.data = this.getData();
    this.inUse = false;
    this.initialize();
    this.log("[Xiaomi Mi Home] Device init - name: " + this.getName() + " - class: " + this.getClass() + " - data: " + JSON.stringify(this.data));
  }

  async initialize() {
    if (Homey.app.gatewaysList.length > 0) {
      this.registerStateChangeListener();
      this.registerCapabilities();
      this.registerConditions();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  registerCapabilities() {
    this.registerToggle("onoff");
  }

  registerConditions() {
    const { conditions } = this.getDriver();
    this.registerCondition(conditions.inUse);
  }

  onEventFromGateway(device) {
    const { triggers } = this.getDriver();
    const data = JSON.parse(device["data"]);

    if (data["status"] == "on") {
      this.updateCapabilityValue("onoff", true);
    }

    if (data["status"] == "off") {
      this.updateCapabilityValue("onoff", false);
    }

    if (data["load_power"]) {
      this.updateCapabilityValue("measure_power", parseInt(data["load_power"]));
    }

    if (data["power_consumed"]) {
      this.updateCapabilityValue("meter_power", parseFloat(data["power_consumed"] / 1000));
    }

    if (data["inuse"]) {
      if (this.inUse != !!parseInt(data["inuse"]) && !!parseInt(data["inuse"])) {
        triggers.inUse.trigger(this, {}, true);
      }
      this.inUse = !!parseInt(data["inuse"]);
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

  registerToggle(name) {
    const sid = this.data.sid;
    this.registerCapabilityListener(name, async value => {
      const model = Homey.app.mihub.getDeviceModelBySid(sid);
      let command = '{"cmd":"write","model":"' + model + '","sid":"' + sid + '","data":{"status":"' + (value ? "on" : "off") + '", "key": "${key}"}}';

      return await Homey.app.mihub.sendWriteCommand(sid, command);
    });
  }

  registerCondition(condition) {
    condition.registerRunListener((args, state) => Promise.resolve(this.inUse));
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

module.exports = MiPlug;
