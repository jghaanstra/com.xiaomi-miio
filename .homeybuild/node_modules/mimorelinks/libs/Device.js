/**
 * 子设备类 & 传感器
 * */
class Device {
    constructor ({model, sid, short_id, data}) {
        this.model = model; // 设备型号
        this.sid = sid; // 设备ID
        this.short_id = short_id; // zigbee设备的短id
        this.data = data; // 设备信息，状态，电量等等
    }

    /**
     * 快速更新当前对象属性
     * */
    update (data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) { // 只能更新已经定义的属性
                this[key] = data[key];
            }
        }
    }
}

module.exports = Device;