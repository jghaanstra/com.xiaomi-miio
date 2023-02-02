const Homey = require("homey");

class MiMotionSensor extends Homey.Device {
  onInit() {
    this.initialize = this.initialize.bind(this);
    this.onEventFromGateway = this.onEventFromGateway.bind(this);
    this.data = this.getData();
    this.initialize();
    this.log("[Xiaomi Mi Home] Device init - name: " + this.getName() + " - class: " + this.getClass() + " - data: " + JSON.stringify(this.data));
  }

  initialize() {
    if (Homey.app.mihub.hubs) {
      this.registerStateChangeListener();
      this.setAvailable();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  onEventFromGateway(device) {
    const { triggers } = this.getDriver();

    const settings = this.getSettings();

    if (device && device.data && device.data["status"] == "motion") {
      this.updateCapabilityValue("alarm_motion", true);
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.updateCapabilityValue("alarm_motion", false);
      }, settings.alarm_duration_number * 1000);
    }

    if (device && device.data && device.data["no_motion"]) {
      this.updateCapabilityValue("alarm_motion", false);
      triggers["motionSensorNoMotion" + device.data["no_motion"]].trigger(this, {}, true);
    }

    if (device && device.data && device.data["voltage"]) {
      const battery = (device.data["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
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

module.exports = MiMotionSensor;
