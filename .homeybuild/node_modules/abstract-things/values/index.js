'use strict';

const amounts = require('amounts');
const color = require('./color');

const IDENTITY = function(input) { return input; };
const ALWAYS_FALSE = function() { return false; };
const TYPE_TAG = '_:value-type';

const change = require('./change');
const marker = Symbol('marker');

function createPublicApi(def) {
	const api = function(value, options, required, msg) {
		if(typeof options !== 'object') {
			msg = required;
			required = options;
		}

		if(typeof required !== 'boolean') {
			msg = required;
			required = false;
		}

		if(required && (typeof value === 'undefined' || value === null)) {
			throw new Error(msg || 'Value required');
		}

		return def.create(value, options);
	};

	for(const m of Object.keys(def.create)) {
		api[m] = def.create[m];
	}

	// toJSON and mark as a value type
	api.toJSON = def.toJSON;
	api[marker] = true;

	return api;
}

class ValueRegistry {
	constructor() {
		this.defs = {};
	}

	register(type, def) {
		if(! def) {
			throw new Error('A definition with create (and optionally toJSON) needed for type ' + type);
		}

		if(typeof def === 'function') {
			def = {
				create: def,
				toJSON: def.toJSON,
				is: def.is
			};
		}

		if(! def.create) {
			throw new Error('create function required for type ' + type);
		}

		if(! def.toJSON) {
			def.toJSON = IDENTITY;
		}

		if(def.comparable) {
			this.register(type + ':change', change(def));
		}

		if(! def.is) {
			def.is = ALWAYS_FALSE;
		}

		this.defs[type] = def;
		this[type] = createPublicApi(def);
	}

	get(type) {
		// Check if this is already a value type
		if(type && type[marker]) return type;

		const resolved = this[type];
		if(resolved && resolved[marker]) {
			// Resolved to something that is a value type, return it
			return resolved;
		} else {
			// Resolved to anything else return null
			return null;
		}
	}

	_toJSON(converter, value) {
		if(value === null || typeof value === 'undefined') {
			return null;
		}
		return converter.toJSON(converter.create(value));
	}

	fromJSON(type, value) {
		if(typeof value === 'undefined') {
			return undefined;
		} else if(value === null) {
			return null;
		}

		type = this.get(type) || this.get('mixed');
		return type(value);
	}

	toJSON(type, value) {
		if(typeof value === 'undefined') {
			return undefined;
		}

		type = this.get(type) || this.get('mixed');
		return type.toJSON(value);
	}

	createToJSON(types) {
		let mixed = this.defs.mixed;
		if(Array.isArray(types)) {
			const converters = types.map(t => {
				if(t.type) t = t.type;
				return this.defs[t];
			});

			return (data) => {
				return Array.prototype.map.call(data, (value, idx) => {
					const converter = converters[idx] || mixed;
					return this._toJSON(converter, value);
				});
			};
		} else {
			if(types.type) types = types.type;
			const converter = this.defs[types] || mixed;
			return (value) => this._toJSON(converter, value);
		}
	}

	createConversion(types) {
		let mixed = this.defs.mixed;
		if(Array.isArray(types)) {
			const converters = types.map(t => {
				if(t.type) t = t.type;
				return this.defs[t];
			});

			return function(data) {
				return Array.prototype.map.call(data, (value, idx) => {
					const converter = converters[idx] || mixed;
					return converter.create(value);
				});
			};
		} else {
			if(types.type) types = types.type;
			const converter = this.defs[types] || mixed;
			return function(data) {
				return converter.create(data);
			};
		}
	}
}

const values = module.exports = new ValueRegistry();

/*
 * Mixed type for dynamic serialization to and from JSON. This type uses a
 * tag to track the type used.
 */
values.register('mixed', {
	create: function(value) {
		let type;
		if(value && value[TYPE_TAG]) {
			type = values.defs[TYPE_TAG];
		}

		if(! type && Array.isArray(value)) {
			type = values.defs.array;
		} else if(! type && typeof value === 'object' && value !== null) {
			let found = false;
			for(let key in values.defs) {
				const def = values.defs[key];
				if(def.is(value)) {
					type = def;
					found = true;
					break;
				}
			}

			if(! found) {
				type = values.defs.object;
			}
		}

		if(type) {
			return type.create(value);
		}

		return value;
	},

	toJSON: function(value) {
		if(typeof value !== 'undefined' && value !== null) {
			for(let key in values.defs) {
				const def = values.defs[key];
				if(def.is && def.is(value)) {
					// Found the correct type
					const json = def.toJSON(value);
					if(typeof json === 'object') {
						json[TYPE_TAG] = key;
					}
					return json;
				}
			}
		}

		if(Array.isArray(value)) {
			return values.defs.array.toJSON(value);
		} else if(typeof value === 'object') {
			return values.defs.object.toJSON(value);
		}
		return value;
	}
});
values.register('object', {
	create: function(value) {
		if(! value) return null;

		const result = {};
		Object.keys(value).forEach(key => {
			result[key] = values.fromJSON('mixed', value[key]);
		});
		return result;
	},

	toJSON: function(value) {
		if(! value) return null;

		const result = {};
		Object.keys(value).forEach(key => {
			result[key] = values.toJSON('mixed', value[key]);
		});
		return result;
	}
});

values.register('array', {
	create: function(value) {
		if(! value) return null;

		if(! Array.isArray(value)) {
			value = [ value ];
		}

		return value.map(v => values.fromJSON('mixed', v));
	},

	toJSON: function(value) {
		if(! value) return null;

		return value.map(v => values.toJSON('mixed', v));
	}
});

values.register('buffer', require('./buffer'));
values.register('boolean', require('./boolean'));
values.register('number', require('./number'));
values.register('string', require('./string'));
values.register('percentage', require('./percentage'));
values.register('code', require('./code'));

values.register('color', color);

const quantities = [
	'angle',
	'area',
	'duration',
	'energy',
	'illuminance',
	'length',
	'mass',
	'power',
	'pressure',
	'soundPressureLevel',
	'speed',
	'temperature',
	'voltage',
	'volume'
];

for(const quantity of quantities) {
	values.register(quantity, amounts[quantity]);
}
