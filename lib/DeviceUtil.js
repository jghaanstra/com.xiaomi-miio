const DEVICE_MAP = {
  gateway: { name: "Gateway", modelCode: "DGNWG02LM", rev: 1 },
  "gateway.v3": { name: "Gateway", modelCode: "DGNWG02LM", rev: 2 },
  magnet: { name: "Mi Window and Door Sensor", modelCode: "MCCGQ01LM" },
  sensor_magnet: { name: "ContactSensor" },
  motion: { name: "Mi Motion Sensor", modelCode: "RTCGQ01LM" },
  switch: { name: "Mi Wirelles Switch", modelCode: "WXKG01LM" },
  sensor_ht: {
    name: "Mi Temperature And Humidity Sensor",
    modelCode: "WSDCGQ01LM"
  },
  ctrl_neutral1: {
    name: "Aqara Wall Switch, Single Rocker",
    modelCode: "QBKG04LM"
  },
  ctrl_neutral2: {
    name: "Aqara Wall Switch, Double Rocker",
    modelCode: "QBKG03LM"
  },
  ctrl_ln1: { name: "Aqara Wall Switch, With Neutral, Single Rocker" },
  "ctrl_ln1.aq1": {
    name: "Aqara Wall Switch, With Neutral, Single Rocker",
    modelCode: "QBKG11LM"
  },
  ctrl_ln2: { name: "Aqara Wall Switch, With Neutral, Double Rocker" },
  "ctrl_ln2.aq1": {
    name: "Aqara Wall Switch, With Neutral, Double Rocker",
    modelCode: "QBKG12LM"
  },
  "86sw1": { name: "Aqara Wirelles Single Switch", modelCode: "WXKG03LM" },
  "86sw2": { name: "Aqara Wirelles Double Switch", modelCode: "WXKG02LM" },
  "remote.b286acn01": {
    name: "Aqara Wirelles Double Switch (advanced)",
    modelCode: "WXKG02LM"
  },
  "sensor_86sw1.aq1": { name: "SingleButton86W" },
  "sensor_86sw2.aq1": { name: "DuplexButton86W" },
  plug: { name: "Mi Smart Plug", modelCode: "ZNCZ02LM" },
  "86plug": { name: "PlugBase86" },
  ctrl_86plug: { name: "AqaraPlug86" },
  "ctrl_86plug.aq1": { name: "Aqara Wall Outlet", modelCode: "QBCZ11LM" },
  cube: { name: "Mi Cube", modelCode: "MFKZQ01LM" },
  "sensor_cube.aqgl01": { name: "Aqara Cube", modelCode: "MFKZQ01LM" },
  sensor_cube: { name: "Aqara Cube", modelCode: "MFKZQ01LM" },
  smoke: { name: "MiJia Smoke Detector", modelCode: "JTYL-GD-01LM/BW" },
  sensor_smoke: { name: "MiJia Smoke Detector", modelCode: "JTYL-GD-01LM/BW" },
  natgas: { name: "MiJia Gas Leak Detector", modelCode: "JTQJ-BF-01LM/BW" },
  sensor_natgas: {
    name: "MiJia Gas Leak Detector",
    modelCode: "JTQJ-BF-01LM/BW"
  },
  curtain: { name: "Aqara Curtain Motor", modelCode: "ZNCLDJ11LM" },
  "curtain.aq2": {
    name: "Aqara Roller Shade Controller",
    modelCode: "ZNGZDJ11LM"
  },
  sensor_magnet: { name: "ContactSensor", modelCode: "MCCGQ01LM" },
  "sensor_magnet.aq2": {
    name: "Aqara Door and Window Sensor",
    modelCode: "MCCGQ11LM"
  },
  sensor_motion: { name: "MotionSensor", modelCode: "RTCGQ01LM" },
  "sensor_motion.aq2": { name: "Aqara Motion Sensor", modelCode: "RTCGQ11LM" },
  sensor_switch: {
    name: "Aqara Wireless Switch Button",
    modelCode: "WXKG11LM"
  },
  "sensor_switch.aq2": {
    name: "Aqara Wireless Switch Button",
    modelCode: "WXKG11LM"
  },
  "sensor_switch.aq3": {
    name: "Aqara Wireless Switch Button (advanced)",
    modelCode: "WXKG12LM"
  },
  weather: { name: "TemperatureAndHumiditySensor" },
  "weather.v1": {
    name: "Aqara Temperature and Humidity Sensor",
    modelCode: "WSDCGQ11LM"
  },
  "sensor_wleak.aq1": {
    name: "Aqara Water Leak Sensor",
    modelCode: "SJCGQ11LM"
  },
  "acpartner.v3": { name: "AqaraACPartner" },
  vibration: { name: "Aqara Vibration Sensor", modelCode: "DJT11LM" },
  lock: { name: "Aqara Smart Door Lock", modelCode: "ZNMS11LM" },
  "sen_ill.agl01": { name: "Light Detection Sensor", modelCode: "GZCGQ01LM" }
};

class DeviceUtil {
  constructor() {
    this.devices = {};
  }

  getBySid(sid) {
    return sid in this.devices ? this.devices[sid] : null;
  }

  add(device) {
    this.devices[device.sid] = device;
    return device;
  }

  update(sid, newDevice) {
    let device = this.getBySid(sid);
    if (null != device) {
      for (let item in newDevice) {
        device[item] = newDevice[item];
      }
    }
    return device;
  }

  addOrUpdate(sid, newDevice) {
    let device = this.getBySid(sid);
    if (null == device) {
      return this.add(newDevice);
    } else {
      return this.update(sid, newDevice);
    }
  }

  remove(sid) {
    delete this.devices[sid];
  }

  getAutoRemoveDevice(threshold) {
    let r = {};

    let nowTime = Date.now();
    for (let sid in this.devices) {
      let device = this.getBySid(sid);
      if (nowTime - device.lastUpdateTime > threshold) {
        r[sid] = device;
      }
    }

    return r;
  }

  getAll() {
    return this.devices;
  }

  getModelInfo(model) {
    return DEVICE_MAP[model];
  }

  clearDevice() {
    this.devices = {};
  }
}

module.exports = DeviceUtil;
