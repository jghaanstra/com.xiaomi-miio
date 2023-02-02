'use strict';

class Change {
	constructor(value, type) {
		this.value = value;
		this.type = type;
	}

	get isIncrease() {
		return this.type === 'increase';
	}

	get isDecrease() {
		return this.type === 'decrease';
	}

	get isSet() {
		return this.type === 'set';
	}
}

const CHANGE = /^\s*([+-])(.+)$/;
module.exports = function(delegate) {
	const create = function(value) {
		if(typeof value === 'string') {
			const parsed = CHANGE.exec(value);

			if(parsed) {
				const value = delegate.create(parsed[2]);
				return new Change(value, parsed[1] === '+' ? 'increase' : 'decrease');
			}

			return new Change(delegate.create(value), 'set');
		} else if(typeof value === 'object') {
			return new Change(value.value, value.type);
		} else {
			throw new Error('Unable to create change for ' + value);
		}
	};

	create.toJSON = function(value) {
		return {
			value: delegate.toJSON(value.value),
			type: value.type
		};
	};

	return create;
};
