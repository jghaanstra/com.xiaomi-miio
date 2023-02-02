class OptionsUtil {
  constructor(options) {
    this.options = options;
    this.multicastAddress = "224.0.0.50";
    this.muticastPort = 4321;
    this.serverPort = 9898;
    this.iv = Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);
    this.bindAddress = this.options.bindAddress || null;
    this.searchGatewayInterval = options.searchGatewayInterval || 10000;
  }

  getSearchGatewayInterval() {
    return this.searchGatewayInterval;
  }

  getBindAddress() {
    return this.options.bindAddress;
  }

  getHosts() {
    let hosts = {};

    let gateways = this.getGateways();
    if (gateways) {
      for (let gatewaySid in gateways) {
        if (gateways[gatewaySid] instanceof Object) {
          if (gateways[gatewaySid]["ip"]) {
            hosts[gatewaySid] = new Object();
            hosts[gatewaySid].ip = gateways[gatewaySid]["ip"];
            if (!gateways[gatewaySid]["port"]) {
              hosts[gatewaySid].port = "9898";
            } else {
              hosts[gatewaySid].port = gateways[gatewaySid]["port"];
            }
          }
        }
      }
    }

    return hosts;
  }

  getGateways() {
    return this.options.gateways;
  }

  isConfigGateway(gatewaySid) {
    if (this.options.gateways && this.options.gateways[gatewaySid]) {
      return true;
    }

    return false;
  }

  isHostGateway(gatewaySid) {
    if (this.options.gateways && this.options.gateways[gatewaySid]) {
      if (this.options.gateways[gatewaySid] instanceof Object) {
        if (this.options.gateways[gatewaySid]["ip"]) {
          return true;
        }
      }
    }

    return false;
  }

  getGatewayPasswordByGatewaySid(gatewaySid) {
    if (this.options.gateways[gatewaySid] instanceof Object) {
      return this.options.gateways[gatewaySid]["password"];
    } else {
      return this.options.gateways[gatewaySid];
    }
  }
}

module.exports = OptionsUtil;
