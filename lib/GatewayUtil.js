class GatewayUtil {
  constructor() {
    this.gateways = {};
  }

  getBySid(sid) {
    return sid in this.gateways ? this.gateways[sid] : null;
  }

  add(gateway) {
    this.gateways[gateway.sid] = gateway;
    return gateway;
  }

  update(sid, newGateway) {
    var gateway = this.getBySid(sid);
    if (null != gateway) {
      for (var item in newGateway) {
        gateway[item] = newGateway[item];
      }
    }
    return gateway;
  }

  addOrUpdate(sid, newGateway) {
    var gateway = this.getBySid(sid);
    if (null == gateway) {
      return this.add(newGateway);
    } else {
      return this.update(sid, newGateway);
    }
  }

  setChildren(sid, result) {
    this.gateways[sid].childDevices.map(child => result);
  }

  remove(sid) {
    delete this.gateways[sid];
  }

  getAll() {
    return this.gateways;
  }

  clearGateways() {
    this.gateways = {};
  }
}

module.exports = GatewayUtil;
