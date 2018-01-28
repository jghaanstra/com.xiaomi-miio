'use strict';

const temp = require('color-temperature');
const convert = require('color-convert');
const string = require('color-string');

const TEMPERATURE = /\s*([0-9]+)\s*[kK]\s*/;
const NAMED_TEMPERATURES = {
	'overcast': 6500,
	'daylight': 5500,
	'sunrise': 2400,
	'sunset': 2400,
	'candle': 2000,
	'moonlight': 4100
};

const conversions = require('../utils/converters')();

const values = [ 'rgb', 'hsl', 'hsv', 'cmyk', 'xyz' ];
// Register conversions from color-convert
values.forEach(a => {
	values.forEach(b =>
		conversions.add(a, b, convert[a][b])
	);
});

// Temperature to RGB
conversions.add('temperature', 'rgb', function(values) {
	const v = temp.colorTemperature2rgb(values[0]);
	return [ v.red, v.green, v.blue ];
});
conversions.add('rgb', 'temperature', function(values) {
	const t = temp.rgb2colorTemperature({
		red: values[0],
		green: values[1],
		blue: values[2]
	});

	if(! t) {
		throw new Error('Can not convert to temperature');
	}

	return [ t ];
});

// Temperature to micro reciprocal degrees
conversions.add('temperature', 'mired', function(values) {
	const t = values[0];
	return [ Math.round(1000000 / t) ];
});
conversions.add('mired', 'temperature', function(values) {
	const m = values[0];
	return [ Math.round(1000000 / m) ];
});

conversions.add('rgb', 'hex', function(values) {
	return string.to.hex(values);
});

conversions.add('hex', 'rgb', function(values) {
	return string.get.rgb(values);
});

conversions.add('xyz', 'xyY', function(values) {
	const X = values[0];
	const Y = values[1];
	const Z = values[2];

	return [
		X / (X + Y + Z),
		Y / (X + Y + Z),
		Y
	];
});

conversions.add('xyY', 'xyz', function(values) {
	const x = values[0];
	const y = values[1];
	const Y = values[2];

	return [
		(x * Y) / y,
		Y,
		((1 - x - y) * Y) / y
	];
});

function parse(color) {
	const t = TEMPERATURE.exec(color);
	if(t) {
		return new Color([ parseInt(t[1]) ], 'temperature');
	} else {
		const namedTemp = NAMED_TEMPERATURES[color.toLowerCase()];
		if(namedTemp) {
			return new Color([ namedTemp ], 'temperature');
		}

		const parsed = string.get(color);
		if(! parsed) {
			throw new Error('Unable to convert to color: ' + color);
		}
		return new Color(parsed.value, parsed.model);
	}
}

function assertModel(current) {
	for(let i=1; i<arguments.length; i++) {
		if(arguments[i] === current) return;
	}

	throw new Error('Need to convert to one of: ' + Array.prototype.slice.call(arguments, 1));
}

class Color {
	constructor(values, model) {
		this.values = values;
		this.model = model;
	}

	_values(model) {
		return conversions.convert(this.model, model, this.values);
	}

	as(model) {
		if(this.model === model) {
			return this;
		}

		const values = this._values(model);
		return new Color(values, model);
	}

	is(model) {
		return this.model === model;
	}

	get hex() {
		return this._values('hex');
	}

	get rgb() {
		return this.as('rgb');
	}

	get hsl() {
		return this.as('hsl');
	}

	get hsv() {
		return this.as('hsv');
	}

	get xyz() {
		return this.as('xyz');
	}

	get xyY() {
		return this.as('xyY');
	}

	get temperature() {
		return this.as('temperature');
	}

	get temp() {
		return this.as('temperature');
	}

	get mired() {
		return this.as('mired');
	}

	get red() {
		assertModel(this.model, 'rgb');
		return this.values[0];
	}

	get green() {
		assertModel(this.model, 'rgb');
		return this.values[1];
	}

	get blue() {
		assertModel(this.model, 'rgb');
		return this.values[2];
	}

	get hue() {
		assertModel(this.model, 'hsl', 'hsv');
		return this.values[0];
	}

	get saturation() {
		assertModel(this.model, 'hsl', 'hsv');
		return this.values[1];
	}

	get lightness() {
		assertModel(this.model, 'hsl');
		return this.values[2];
	}

	get value() {
		assertModel(this.model, 'hsv', 'mired');
		switch(this.model) {
			case 'mired':
				return this.values[0];
			case 'hsv':
				return this.values[2];
		}
	}

	get kelvins() {
		assertModel(this.model, 'temperature');
		return this.values[0];
	}

	get x() {
		assertModel(this.model, 'xyz', 'xyY');
		return this.values[0];
	}

	get y() {
		assertModel(this.model, 'xyz', 'xyY');
		return this.values[1];
	}

	get Y() {
		assertModel(this.model, 'xyY');
		return this.values[2];
	}

	get z() {
		assertModel(this.model, 'xyz');
		return this.values[2];
	}
}

module.exports = function(value, model) {
	if(value instanceof Color) {
		return value;
	}

	const type = typeof value;
	if(type === 'string') {
		return parse(value);
	} else if(Array.isArray(value)) {
		return new Color(value, model);
	} else if(type === 'object') {
		return new Color(value.values, value.model);
	} else {
		throw new Error('Unable to create color');
	}
};

module.exports.toJSON = function(value) {
	return {
		values: value.values,
		model: value.model
	};
};

module.exports.is = function(v) {
	return v instanceof Color;
};

[ 'cmyk', 'rgb', 'temperature', 'mired', 'xyz', 'xyY', 'hsl', 'hsv' ].forEach(function(name) {
	module.exports[name] = function() {
		return new Color(Array.prototype.slice.call(arguments), name);
	};
});
