'use strict';

/**
 * Mapping from models into high-level devices.
 */
const AirMonitor = require('./devices/air-monitor');
const AirPurifier = require('./devices/air-purifier');
const Gateway = require('./devices/gateway');

const Vacuum = require('./devices/vacuum');

const PowerPlug = require('./devices/power-plug');
const PowerStrip = require('./devices/power-strip');

const Humidifier = require('./devices/humidifier');
const Humidifier2 = require('./devices/humidifier2');

const YeelightColor = require('./devices/yeelight.color');
const YeelightMono = require('./devices/yeelight.mono');

const PhilipsLightBulb = require('./devices/philips-light-bulb');

module.exports = {
	'zhimi.airmonitor.v1': AirMonitor,

  'zhimi.airpurifier.v1': AirPurifier,
	'zhimi.airpurifier.v2': AirPurifier,
	'zhimi.airpurifier.v3': AirPurifier,
  'zhimi.airpurifier.v4': AirPurifier,
  'zhimi.airpurifier.v5': AirPurifier,
	'zhimi.airpurifier.v6': AirPurifier,
  'zhimi.airpurifier.v7': AirPurifier,

	'zhimi.airpurifier.m1': AirPurifier,
	'zhimi.airpurifier.m2': AirPurifier,

	'zhimi.airpurifier.ma2': AirPurifier,
	'zhimi.airpurifier.mc1': AirPurifier,

	'zhimi.humidifier.v1': Humidifier,
	'zhimi.humidifier.ca1': Humidifier2,
  'zhimi.humidifier.cb1': Humidifier2,

	'chuangmi.plug.m1': PowerPlug,
	'chuangmi.plug.v1': require('./devices/chuangmi.plug.v1'),
	'chuangmi.plug.v2': PowerPlug,

	'rockrobo.vacuum.v1': Vacuum,
	'roborock.vacuum.s5': Vacuum,

	'lumi.gateway.v2': Gateway.WithLightAndSensor,
	'lumi.gateway.v3': Gateway.WithLightAndSensor,
	'lumi.acpartner.v1': Gateway.Basic,
	'lumi.acpartner.v2': Gateway.Basic,
	'lumi.acpartner.v3': Gateway.Basic,

	'qmi.powerstrip.v1': PowerStrip,
	'zimi.powerstrip.v2': PowerStrip,

	'yeelink.light.lamp1': YeelightMono,
	'yeelink.light.mono1': YeelightMono,
	'yeelink.light.color1': YeelightColor,
	'yeelink.light.strip1': YeelightColor,

	'philips.light.sread1': require('./devices/eyecare-lamp2'),
	'philips.light.bulb': PhilipsLightBulb,
  'philips.light.candle': PhilipsLightBulb,
	'philips.light.candle2': PhilipsLightBulb,
  'philips.light.ceiling': PhilipsLightBulb,
  'philips.light.zyceiling': PhilipsLightBulb,
  'philips.light.mono1': PhilipsLightBulb,
  'philips.light.downlight': PhilipsLightBulb
};
