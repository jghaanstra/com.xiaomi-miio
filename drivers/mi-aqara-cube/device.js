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
    if (Homey.app.gatewaysList.length > 0) {
      this.registerStateChangeListener();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  onEventFromGateway(device) {
    const { triggers } = this.getDriver();
    const data = JSON.parse(device["data"]);

    if (data["voltage"]) {
      const battery = (data["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
    }

    if (data["voltage"]) {
      const battery = (data["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
    }

    if (data["status"] == "shake_air") {
      triggers.shake_air.trigger(this, {}, true);
    }

    if (data["status"] == "tap_twice") {
      triggers.tap_twice.trigger(this, {}, true);
    }

    if (data["status"] == "move") {
      triggers.move.trigger(this, {}, true);
    }

    if (data["status"] == "flip180") {
      triggers.flip180.trigger(this, {}, true);
    }

    if (data["status"] == "flip90") {
      triggers.flip90.trigger(this, {}, true);
    }

    if (data["status"] == "free_fall") {
      triggers.free_fall.trigger(this, {}, true);
    }

    if (data["status"] == "alert") {
      triggers.alert.trigger(this, {}, true);
    }

    if (parseInt(data["rotate"]) > 0) {
      triggers.rotatePositive.trigger(this, {}, true);
    }

    if (parseInt(data["rotate"]) < 0) {
      triggers.rotateNegative.trigger(this, {}, true);
    }

    if (data["rotate"]) {
      let tokens = {
        cube_rotated: parseInt(data["rotate"])
      };

      triggers.cubeRotated.trigger(this, tokens, true);
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
