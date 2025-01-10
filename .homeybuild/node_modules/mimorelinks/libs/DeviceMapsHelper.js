/**
 * 网关与子设备映射管理
 */
class DeviceMapsHelper {
    constructor () {
        this.deviceMaps = {}; // 网关与子设备的映射，gatewaySid->[sid,sid2...]
    }

    addOrUpdate (gatewaySid, deviceSids) {
        this.deviceMaps[gatewaySid] = deviceSids;
    }

    remove (gatewaySid) {
        delete this.deviceMaps[gatewaySid];
    }

    /**
     * 根据网关ID查找设备ID列表
     * @return {Array}
     * */
    getDeviceSids (gatewaySid) {
        return this.deviceMaps[gatewaySid];
    }

    /**
     * 根据设备ID查找所属网关ID
     * */
    getGatewaySidByDeviceSid (deviceSid) {
        for (let gatewaySid in this.deviceMaps) {
            let deviceIds = this.deviceMaps[gatewaySid];
            for (let i=0; i<deviceIds.length; i++) {
                if (deviceIds[i] === deviceSid) {
                    return gatewaySid;
                }
            }
        }
        return null;
    }

    getAll () {
        return this.deviceMaps;
    }
}

module.exports = DeviceMapsHelper;