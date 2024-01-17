'use strict';

/**
 * Mapping from models into high-level devices.
 */

/* Airmonitors */
const AirMonitor = require('./devices/air-monitor');

/* Air Purifiers */
const AirPurifier = require('./devices/air-purifier');
const AirPurifier3 = require('./devices/air-purifier3');
const AirPurifier3c = require('./devices/air-purifier3c');

/* Humidifiers */
const Humidifier = require('./devices/humidifier');
const Humidifier2 = require('./devices/humidifier2');

/* Fans */
const DmakerFan = require('./devices/fan/dmaker-fan');
const ZhiMiFan = require('./devices/fan/zhimi-fan-common');
const ZhiMiFanv2v3 = require('./devices/fan/zhimi-fan-v2-v3');

/* Vacuums */
const Vacuum = require('./devices/vacuum');
const MijiaVacuum = require("./devices/mijiavacuum");
const ViomiVacuum = require("./devices/viomivacuum");

/* Power Plugs and Strips */
const PowerPlug = require('./devices/power-plug');
const PowerStrip = require('./devices/power-strip');

/* Philips Lights */
const PhilipsLightBulb = require('./devices/philips-light-bulb');

/* Gateway */
const Gateway = require('./devices/gateway');

/* Yeelight */
const YeelightColor = require('./devices/yeelight.color');
const YeelightMono = require('./devices/yeelight.mono');


module.exports = {
	/* Airmonitors */
	'zhimi.airmonitor.v1': AirMonitor, // generic driver
	'cgllc.airmonitor.b1': AirMonitor, // own driver
	'cgllc.airmonitor.s1':  AirMonitor, // own driver

	/* Air Purifiers */
  'zhimi.airpurifier.v1': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.v2': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.v3': AirPurifier, // generic advanced driver
  'zhimi.airpurifier.v5': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.v6': AirPurifier, // generic advanced driver
  'zhimi.airpurifier.v7': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.m1': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.m2': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.ma1': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.ma2': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.sa1': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.sa2': AirPurifier, // generic advanced driver
	'zhimi.airpurifier.mc1': AirPurifier, // generic advanced driver
  'zhimi.airpurifier.mc2': AirPurifier, // generic advanced driver
	'airdog.airpurifier.x3': AirPurifier, // untested generic driver
	'airdog.airpurifier.x5': AirPurifier, // untested generic driver
	'airdog.airpurifier.x7sm': AirPurifier, // untested generic driver

	/* Humidifiers */
	'zhimi.humidifier.v1': Humidifier, // generic v1/v2 driver
	'zhimi.humidifier.ca1': Humidifier2, // generic v1/v2 driver
	'zhimi.humidifier.cb1': Humidifier2, // generic v1/v2 driver
	'zhimi.humidifier.cb2': Humidifier2, // generic v1/v2 driver

	'shuii.humidifier.jsq001': Humidifier2, // untested generic driver

	/* Fans */
	'dmaker.fan.p5': DmakerFan, // generic

  'zhimi.fan.v2': ZhiMiFanv2v3, // generic advanced driver
  'zhimi.fan.v3': ZhiMiFanv2v3, // generic advanced driver
	'zhimi.fan.sa1': ZhiMiFan, // generic advanced driver
  'zhimi.fan.za1': ZhiMiFan, // generic advanced driver
	'zhimi.fan.za3': ZhiMiFan, // generic advanced driver
	'zhimi.fan.za4': ZhiMiFan, // generic advanced driver

	/* Vacuums */
	"rockrobo.vacuum.v1": Vacuum,
	"roborock.vacuum.c1": Vacuum,
	"rockrobo.vacuum.1s": Vacuum,
	"roborock.vacuum.e2": Vacuum,
	"roborock.vacuum.s4": Vacuum,
  "roborock.vacuum.s5": Vacuum,
  "roborock.vacuum.s5e": Vacuum,
  "roborock.vacuum.s6": Vacuum,
	"roborock.vacuum.t4": Vacuum,
  "roborock.vacuum.t6": Vacuum,
	"roborock.vacuum.a08": Vacuum,
	"roborock.vacuum.a09": Vacuum,
  "roborock.vacuum.a10": Vacuum,
	"roborock.vacuum.a11": Vacuum,
	"roborock.vacuum.a14": Vacuum,
	"roborock.vacuum.a15": Vacuum,
	"roborock.vacuum.a19": Vacuum,
	"roborock.vacuum.a23": Vacuum,
	"roborock.vacuum.a26": Vacuum,
	"roborock.vacuum.a27": Vacuum,
	"roborock.vacuum.a29": Vacuum,
	"roborock.vacuum.a34": Vacuum,
	"roborock.vacuum.a38": Vacuum,
	"roborock.vacuum.a40": Vacuum,
	"roborock.vacuum.a46": Vacuum,
	"roborock.vacuum.a51": Vacuum,
	"roborock.vacuum.a62": Vacuum,
	"roborock.vacuum.a65": Vacuum,
	"roborock.vacuum.a70": Vacuum,
	"roborock.vacuum.a72": Vacuum,
	"roborock.vacuum.a73": Vacuum,
	"roborock.vacuum.a75": Vacuum,
	"roborock.vacuum.p5": Vacuum,

	"roborock.vacuum.m1s": MijiaVacuum,
  
  "viomi.vacuum.v7": ViomiVacuum,  // own driver
  "viomi.vacuum.v8": ViomiVacuum,

	/* Power Plugs and Strips */
	'chuangmi.plug.m1': PowerPlug, // own driver
	'chuangmi.plug.m2': PowerPlug, // own driver
	'chuangmi.plug.m3': PowerPlug, // own driver
	'chuangmi.plug.v1': require('./devices/chuangmi.plug.v1'), // own driver
	'chuangmi.plug.v2': PowerPlug, // own driver
	'chuangmi.plug.hmi206': PowerPlug, // own driver
	'qmi.powerstrip.v1': PowerStrip, // own driver
	'zimi.powerstrip.v2': PowerStrip, // generic driver

	/* Philips Lights */
	'philips.light.sread1': require('./devices/eyecare-lamp2'), // own driver
	'philips.light.sread2': require('./devices/eyecare-lamp2'), // own driver
	'philips.light.bulb': PhilipsLightBulb, // generic driver
  'philips.light.candle': PhilipsLightBulb, // generic driver
	'philips.light.candle2': PhilipsLightBulb, // generic driver
  'philips.light.ceiling': PhilipsLightBulb, // generic driver
  'philips.light.zyceiling': PhilipsLightBulb, // generic driver
  'philips.light.mono1': PhilipsLightBulb,  // generic driver
  'philips.light.downlight': PhilipsLightBulb, // generic driver
	'philips.light.hbulb': PhilipsLightBulb, // untested
	'philips.light.moonlight': PhilipsLightBulb, // untested / own driver
	'philips_light_cbulb': PhilipsLightBulb, // untested / own driver

	/* Gateways */
	'lumi.gateway.v2': Gateway.WithLightAndSensor,
	'lumi.gateway.v3': Gateway.WithLightAndSensor,
	//'lumi.gateway.mcn001': Gateway.WithLightAndSensor,
	'lumi.acpartner.v1': Gateway.Basic,
	'lumi.acpartner.v2': Gateway.Basic,
	'lumi.acpartner.v3': Gateway.Basic,

	/* Yeelights */
	'yeelink.light.lamp1': YeelightMono,
	'yeelink.light.mono1': YeelightMono,
	'yeelink.light.color1': YeelightColor,
	'yeelink.light.strip1': YeelightColor
};