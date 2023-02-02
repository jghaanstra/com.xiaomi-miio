const Homey = require("homey");

class AqaraTemperatureHumiditySensor extends Homey.Device {
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
      this.registerConditions();
      this.setAvailable();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  registerConditions() {
    const { conditions } = this.getDriver();
    this.registerCondition("measure_temperature", conditions.measure_temperature_between);
    this.registerCondition("measure_humidity", conditions.measure_humidity_between);
  }

  onEventFromGateway(device) {
    const settings = this.getSettings();

    if (device && device.data && device.data["voltage"]) {
      const battery = (device.data["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
    }

    if (device && device.data && device.data["temperature"]) {
      if (settings.addOrTakeOffset == "add") {
        this.updateCapabilityValue("measure_temperature", parseFloat(parseFloat(device.data["temperature"] / 100 + parseFloat(settings.offset)).toFixed(1)));
      } else if (settings.addOrTakeOffset == "take") {
        this.updateCapabilityValue("measure_temperature", parseFloat(parseFloat(device.data["temperature"] / 100 - parseFloat(settings.offset)).toFixed(1)));
      }
    }

    if (device && device.data && device.data["humidity"]) {
      this.updateCapabilityValue("measure_humidity", parseFloat(parseFloat(device.data["humidity"] / 100).toFixed(1)));
    }

    if (device && device.data && device.data["pressure"]) {
      this.updateCapabilityValue("measure_pressure", parseFloat(parseFloat(device.data["pressure"] / 100).toFixed(1)));
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

  registerCondition(name, condition) {
    condition.registerRunListener((args, state) => {
      let value1, value2;
      if (args.value1 < args.value2) {
        value1 = args.value1;
        value2 = args.value2;
      } else {
        value1 = args.value2;
        value2 = args.value1;
      }
      return args.device.getCapabilityValue(name) >= value1 && args.device.getCapabilityValue(name) <= value2;
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

module.exports = AqaraTemperatureHumiditySensor;
