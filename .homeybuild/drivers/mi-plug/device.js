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
    if (Homey.app.mihub.hubs) {
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

    if (device && device.data && device.data["status"] == "on") {
      this.updateCapabilityValue("onoff", true);
    }

    if (device && device.data && device.data["status"] == "off") {
      this.updateCapabilityValue("onoff", false);
    }

    if (device && device.data && device.data["load_power"]) {
      this.updateCapabilityValue("measure_power", parseInt(device.data["load_power"]));
    }

    if (device && device.data && device.data["power_consumed"]) {
      this.updateCapabilityValue("meter_power", parseFloat(device.data["power_consumed"] / 1000));
    }

    if (device && device.data && device.data["inuse"]) {
      if (this.inUse != !!parseInt(device.data["inuse"]) && !!parseInt(device.data["inuse"])) {
        triggers.inUse.trigger(this, {}, true);
      }
      this.inUse = !!parseInt(device.data["inuse"]);
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

  registerToggle(name) {
    const sid = this.data.sid;
    this.registerCapabilityListener(name, async value => {
      return await Homey.app.mihub.sendWrite(sid, { channel_0: value ? "on" : "off" });
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
