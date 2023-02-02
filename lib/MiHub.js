const EventEmitter = require("events");
const Homey = require("homey");
const MiGateway = require("mimorelinks");

class MiHub extends EventEmitter {
  constructor(log) {
    super();
    this.setMaxListeners(150);
    this.log = log;
    this.log("Mi Hub initialized!");
    this.hubs;
    this.hubsList = Homey.ManagerSettings.get("gatewaysList") || [];
    this.MiInitialize(this.hubsList);
    this.gateways;
  }

  MiInitialize(gateways) {
    this.log(gateways);
    var that = this;
    if (gateways.length > 0) {
      this.gatewaysList = [];
      gateways.forEach(gateway => {
        this.log(gateway);
        let data = {
          sid: gateway.mac.toLowerCase(),
          password: gateway.password.toUpperCase()
        };
        this.gatewaysList.push(data);
      });
      if (MiGateway._start) {
        MiGateway.stop();
        this.log("Stop running Mi Gateway!");
      }
      MiGateway.create(this.gatewaysList, {
        onMessage(msg) {
          that.devicesReport(msg);
        }
      });
      MiGateway.start();
      this.gateways = MiGateway._miAqara.gatewayHelper.gateways;
      this.hubs = true;
    } else {
      this.log("Please insert gateway mac address and password in settings on Manager Settings");
      if (MiGateway._start) {
        MiGateway.stop();
        this.log("Mi Hub stopped!!!");
      }
      this.hubs = false;
    }
  }

  async getDevice(sid) {
    const device = MiGateway.getDeviceBySid(sid);
    return device;
  }

  async getDevicesByModel(modelTypes) {
    const devices = MiGateway.getDeviceList();
    return devices.filter(device => modelTypes.includes(device.model));
  }

  async getGatewayByModel(modelTypes) {
    const gateways = MiGateway.getGatewayList();
    return gateways.filter(gateway => modelTypes.includes(gateway.model));
  }

  updateGateways(gateways) {
    this.log("updateGateways: ", gateways);
    this.MiInitialize(gateways);
  }

  devicesReport(data) {
    const devices = MiGateway.getDeviceList();
    const gateways = MiGateway.getGatewayList();

    if (data.cmd == "report") {
      devices.forEach(device => {
        if (data.sid == device.sid) {
          this.emit(`${device.sid}`, device);
        }
      });
    } else if (data.cmd == "read_ack") {
      devices.forEach(device => {
        if (data.sid == device.sid) {
          this.emit(`${device.sid}`, device);
        }
      });

      gateways.forEach(gateway => {
        if (data.sid == gateway.sid) {
          this.emit(`${gateway.sid}`, data);
        }
      });
    }
  }

  async sendWrite(sid, data) {
    MiGateway.change({ sid: sid, data: data });
  }

  async sendWriteCmd(sid, data) {
    MiGateway.writeCmd(sid, data);
  }

  async controlLightHLS(sid, hue, saturation, brightness) {
    MiGateway.controlLightHLS({
      sid: sid,
      hue: hue,
      saturation: saturation,
      brightness: brightness
    });
  }

  async controlLightRGB(sid, rgb) {
    MiGateway.controlLightRGB({ sid: sid, rgb: rgb });
  }

  async controlLightPower(sid, power) {
    MiGateway.controlLightPower({ sid: sid, power: power });
  }

  async controlMid(sid, mid, vol) {
    MiGateway.controlMid({ sid: sid, mid: mid, vol: vol });
  }

  getGateways() {
    return this.gatewaysList;
  }
}

module.exports = MiHub;
