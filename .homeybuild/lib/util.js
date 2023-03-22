'use strict';

class Util {

  static modelToFriendlyNameWiFi = {
    'zhimi.airmonitor.v1': 'Mi Air Quality Monitor',
    'cgllc.airmonitor.b1': 'Mi Air Quality Monitor gen2',
    'cgllc.airmonitor.s1': 'Mi ClearGrass Air Detector',
    'zhimi.airpurifier.v1': 'Air Purifier',
    'zhimi.airpurifier.v2': 'Air Purifier v2',
    'zhimi.airpurifier.v3': 'Air Purifier v3',
    'zhimi.airpurifier.v4': 'Air Purifier v4',
    'zhimi.airpurifier.v5': 'Air Purifier v5',
    'zhimi.airpurifier.v6': 'Air Purifier Pro',
    'zhimi.airpurifier.v7': 'Air Purifier Pro v7',
    'zhimi.airpurifier.m1': 'Air Purifier 2 Mini',
    'zhimi.airpurifier.m2': 'Air Purifier Mini',
    'zhimi.airpurifier.ma2': 'Air Purifier MA2',
    'zhimi.airpurifier.mc1': 'Air Purifier 2S',
    'zhimi.airpurifier.mc2': 'Air Purifier 2A',
    'airdog.airpurifier.x3': 'Airdog X3 Air Purifier - untested',
    'airdog.airpurifier.x5': 'Airdog X5 Air Purifier - untested',
    'airdog.airpurifier.x7sm': 'Airdog X7s Air Purifier - untested',
    'zhimi.airpurifier.mb3': 'Air Purifier 3H',
    'zhimi.airpurifier.mb4': 'Air Purifier 3C',
    'zhimi.airfresh.va2': 'Mi Air Fresh VA2',
    'zhimi.airfresh.va4': 'Mi Air Fresh VA4',
    'dmaker.airfresh.t2017': 'Mi Air Purifier (MJXFJ-300-G1)',
    'zhimi.humidifier.v1': 'Humidifier v1',
    'zhimi.humidifier.ca1': 'Mi (Air) Humidifier v2 CA1',
    'zhimi.humidifier.cb1': 'Mi (Air) Humidifier v2 CB1',
    'zhimi.humidifier.ca4': 'Mi Evaporative Humidifier v2',
    'deerma.humidifier.jsq': 'Mijia Smart Sterilization Humidifier JSQ',
    'deerma.humidifier.jsq1': 'Mijia Pure Smart Humidifier JSQ1 - untested',
    'deerma.humidifier.jsq4': 'Mijia Pure Smart Humidifier JSQ4',
    'deerma.humidifier.jsq5': 'Mijia Pure Smart Humidifier JSQ5',
    'deerma.humidifier.mjjsq': 'Mijia Smart Sterilization Humidifier MJJSQ',
    'leshow.humidifier.jsq1': 'Xiaomi Humidifier Pro',
    'shuii.humidifier.jsq001': 'Humidifier JSQ001 - untested',
    'dmaker.fan.p5': 'DMaker Fan X1',
    'dmaker.fan.p11': 'Mi Smart Standing Fan Pro',
    'dmaker.fan.p15': 'Mi Smart Standing Fan Pro EU',
    'zhimi.fan.v1': 'ZhiMi Fan',
    'zhimi.fan.v2': 'ZhiMi Fan v2',
    'zhimi.fan.v3': 'ZhiMi Fan v3',
    'zhimi.fan.sa1': 'ZhiMi Fan',
    'zhimi.fan.za1': 'ZhiMi Fan',
    'zhimi.fan.za3': 'ZhiMi Fan',
    'zhimi.fan.za4': 'ZhiMi Fan',
    'zhimi.fan.za5': 'ZhiMi Fan',
    'rockrobo.vacuum.v1': 'RoboRock Vacuum v1',
    'roborock.vacuum.c1': 'RoboRock Vacuum S5 Max',
    'rockrobo.vacuum.1s': 'RoboRock Vacuum 1S',
    'roborock.vacuum.e2': 'RoboRock Vacuum E2',
    'roborock.vacuum.s4': 'RoboRock Vacuum S4',
    'roborock.vacuum.s5': 'RoboRock Vacuum S5',
    'roborock.vacuum.s5e': 'RoboRock Vacuum S5e',
    'roborock.vacuum.s6': 'RoboRock Vacuum S6',
    'roborock.vacuum.t4': 'RoboRock Vacuum T4',
    'roborock.vacuum.t6': 'RoboRock Vacuum T6',
    'roborock.vacuum.a08': 'RoboRock Vacuum S6 Pure',
    'roborock.vacuum.a09': 'RoboRock Vacuum T7 Pro',
    'roborock.vacuum.a10': 'RoboRock Vacuum S6 MaxV',
    'roborock.vacuum.a11': 'RoboRock Vacuum T7',
    'roborock.vacuum.a14': 'RoboRock Vacuum T7S',
    'roborock.vacuum.a15': 'RoboRock Vacuum S7',
    'roborock.vacuum.a19': 'RoboRock Vacuum S4 Max',
    'roborock.vacuum.a26': 'RoboRock Vacuum G10S Pro',
    'roborock.vacuum.a27': 'RoboRock Vacuum S7 MaxV Ultra',
    'roborock.vacuum.a38': 'RoboRock Vacuum Q7 Max',
    'roborock.vacuum.p5': 'RoboRock Vacuum P5',
    'roborock.vacuum.m1s': 'Mijia Vacuum M1S',
    'dreame.vacuum.mc1808': 'Mijia Vacuum 1C',
    'dreame.vacuum.p2029': 'Dreame Bot L10 Pro',
    'dreame.vacuum.p2041': 'Xiaomi Vacuum 1T',
    'mijia.vacuum.v2': 'Xiaomi Mijia G1 Robot Vacuum Mop',
    'viomi.vacuum.v7': 'Mi Robot Vacuum-Mop P v7',
    'viomi.vacuum.v8': 'Mi Robot Vacuum-Mop P v8',
    'chuangmi.plug.m1': 'Mi Smart Plug WiFi',
    'chuangmi.plug.v1': 'Mi Smart Plug With USB WiFi',
    'chuangmi.plug.v2': 'Mi Smart Plug With 2 USB WiFi',
    'chuangmi.plug.v3': 'Mi Smart Plug With 2 USB WiFi',
    'qmi.powerstrip.v1': 'Mi Power Strip v1',
    'zimi.powerstrip.v2': 'Mi Power Strip v2',
    'philips.light.sread1': 'Eyecare Lamp 2',
    'philips.light.bulb': 'Philips Light Bulb',
    'philips.light.candle': 'Philips Candle',
    'philips.light.candle2': 'Philips Candle',
    'philips.light.ceiling': 'Philips Ceiling Light',
    'philips.light.zyceiling': 'Philips Ceiling Light',
    'philips.light.mono1': 'Philips Light Bulb',
    'philips.light.downlight': 'Philips Down Light',
    'lumi.gateway.v2': 'Xiaomi Gateway v1',
    'lumi.gateway.v3': 'Xiaomi Gateway v2',
    'lumi.acpartner.v1': 'Aqara Gateway v1',
    'lumi.acpartner.v2': 'Aqara Gateway v2',
    'lumi.acpartner.v3': 'Aqara Gateway v3',
    'chuangmi.remote.v2': 'Universal Intelligent IR Remote Controller'
  }

  static modelToFriendlyNameSubdevice = {
    'remote.b186acn01': 'Aqara Wireless Wall Single Switch (Advanced)',
    'remote.b286acn01': 'Aqara Wireless Wall Double Switch (Advanced)',
    '86sw1': 'Aqara Wireless Wall Single Switch',
    '86sw2': 'Aqara Wireless Wall Double Switch',
    'sensor_switch.aq2': 'Aqara Wireless Button',
    'sensor_switch.aq3': 'Aqara Wireless Button (Advanced)',
    'sensor_switch': 'Aqara Wireless Button',
    'ctrl_ln1.aq1': 'Aqara Smart Wall Single Switch With Neutral',
    'switch_b1nacn02': 'Aqara Smart Wall Single Switch With Neutral',
    'ctrl_ln1.aq2': 'Aqara Smart Wall Double Switch With Neutral',
    'switch_b2nacn02': 'Aqara Smart Wall Double Switch With Neutral',
    'ctrl_neutral1': 'Aqara Smart Wall Single Switch No Neutral',
    'switch_b1lacn02': 'Aqara Smart Wall Single Switch No Neutral',
    'ctrl_neutral2': 'Aqara Smart Wall Double Switch No Neutral',
    'switch_b2lacn02': 'Aqara Smart Wall Double Switch No Neutral',
    'curtain': 'Aqara Curtain Motor',
    'curtain.hagl04': 'Aqara Curtain Motor',
    'curtain.aq2': 'Aqara Roller Shade Controller',
    'sensor_magnet.aq2': 'Aqara Magnet Sensor',
    'sensor_motion.aq2': 'Aqara Motion Sensor',
    'weather.v1': 'Aqara Temperature & Humidity Sensor',
    'sensor_wleak.aq1': 'Aqara Waterleak Sensor',
    'cube': 'Mi Aqara Cube',
    'sensor_cube.aqgl01': 'Mi Aqara Cube',
    'sensor_cube': 'Mi Aqara Cube',
    'switch': 'Mi Wireless Button',
    'magnet': 'Mi Magnet Sensor',
    'motion': 'Mi Motion Sensor',
    'sensor_ht': 'Mi Temperature & Humidity Sensor',
    'natgas': 'Miia Gas Leak Detector',
    'sensor_natgas': 'Miia Gas Leak Detector',
    'ctrl_86plug.aq1': 'Aqara Wall Outlet',
    'lumi.ctrl_86plug.aq1': 'Aqara Wall Outlet',
    'lumi.ctrl_86plug': 'Aqara Wall Outlet',
    'lock.aq1': 'Aqara Lock',
    'relay.c2acn01': 'Aqara 2 Channel Relay',
    'lumi.relay.c2acn01': 'Aqara 2 Channel Relay',
    'vibration': 'Vibration Sensor',
    'plug': 'Mi Smart Plug'
  }

  constructor(opts) {
    this.homey = opts.homey;
  }

  getFriendlyNameWiFi(model) {
    return Util.modelToFriendlyNameWiFi[model];
  }

  getFriendlyNameSubdevice(model) {
    return Util.modelToFriendlyNameSubdevice[model];
  }

	normalize(value, min, max) {
    var normalized = (value - min) / (max - min);
    return Number(normalized.toFixed(2));
  }

  denormalize(normalized, min, max) {
    var denormalized = ((1 - normalized) * (max - min) + min);
    return Number(denormalized.toFixed(0));
  }

  getRandomTimeout(max) {
    return ((Math.floor(Math.random() * Math.floor(max)) * 1000) + 2000);
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  sleep(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
  }

}

module.exports = Util;