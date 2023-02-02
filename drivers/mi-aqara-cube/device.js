const Homey = require("homey");

class MiAqaraCube extends Homey.Device {
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
    } else {
      this.unregisterStateChangeListener();
    }
  }

  onEventFromGateway(device) {
    const { triggers } = this.getDriver();

    if (device && device.data && device.data["voltage"]) {
      const battery = (device.data["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
    }

    if (device && device.data && device.data["status"] == "shake_air") {
      triggers.shake_air.trigger(this, {}, true);
    }

    if (device && device.data && device.data["status"] == "tap_twice") {
      triggers.tap_twice.trigger(this, {}, true);
    }

    if (device && device.data && device.data["status"] == "move") {
      triggers.move.trigger(this, {}, true);
    }

    if (device && device.data && device.data["status"] == "flip180") {
      triggers.flip180.trigger(this, {}, true);
    }

    if (device && device.data && device.data["status"] == "flip90") {
      triggers.flip90.trigger(this, {}, true);
    }

    if (device && device.data && device.data["status"] == "free_fall") {
      triggers.free_fall.trigger(this, {}, true);
    }

    if (device && device.data && device.data["status"] == "alert") {
      triggers.alert.trigger(this, {}, true);
    }

    if (parseInt(device.data["rotate"]) > 0) {
      triggers.rotatePositive.trigger(this, {}, true);
    }

    if (parseInt(device.data["rotate"]) < 0) {
      triggers.rotateNegative.trigger(this, {}, true);
    }

    if (device && device.data && device.data["rotate"]) {
      let tokens = {
        cube_rotated: parseInt(device.data["rotate"])
      };

      triggers.cubeRotated.trigger(this, tokens, true);
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

module.exports = MiAqaraCube;
