'use strict';

const amount = require('./lib/amount');
const angle = require('./lib/angle');
const area = require('./lib/area');
const duration = require('./lib/duration');
const energy = require('./lib/energy');
const illuminance = require('./lib/illuminance');
const length = require('./lib/length');
const mass = require('./lib/mass');
const power = require('./lib/power');
const pressure = require('./lib/pressure');
const soundPressureLevel = require('./lib/soundPressureLevel');
const speed = require('./lib/speed');
const temperature = require('./lib/temperature');
const voltage = require('./lib/voltage');
const volume = require('./lib/volume');

module.exports = {
	amount, generic: amount,
	area, angle, duration, energy, illuminance, length, mass, power, pressure,
	soundPressureLevel, speed, temperature, voltage, volume
};
