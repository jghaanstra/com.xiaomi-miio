const Homey = require("homey");

class AqaraWirellesSwitch extends Homey.Device {
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

    if (data["channel_0"] == "click") {
      triggers.switch_left_click.trigger(this, {}, true);
    }

    if (data["channel_0"] == "double_click") {
      triggers.switch_left_double_click.trigger(this, {}, true);
    }

    if (data["channel_0"] == "long_click") {
      triggers.switch_left_long_click.trigger(this, {}, true);
    }

    if (data["channel_1"] == "click") {
      triggers.switch_right_click.trigger(this, {}, true);
    }

    if (data["channel_1"] == "double_click") {
      triggers.switch_right_double_click.trigger(this, {}, true);
    }

    if (data["channel_1"] == "long_click") {
      triggers.switch_right_long_click.trigger(this, {}, true);
    }

    if (data["dual_channel"]) {
      triggers.switch_both_click.trigger(this, {}, true);
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

module.exports = AqaraWirellesSwitch;
