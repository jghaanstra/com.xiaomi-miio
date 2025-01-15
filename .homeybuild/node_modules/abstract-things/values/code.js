'use strict';

/**
 * Handler for codes. Can be constructed from strings, numbers and arrays
 * and objects.
 */
module.exports =  {
	create(value) {
		if(typeof value === 'object') {
			if(Array.isArray(value)) {
				/*
				 * This is an array, assume first item is the code and the
				 * second is the description.
				 */
				return new Code(value[0], value[1]);
			} else {
				/*
				 * Regular object, id is either in `id` or `code`.
				 * Description is in either `description` or `message`.
				 */
				return new Code(value.id || value.code, value.description || value.message);
			}
		} else if(typeof value === 'string') {
			// String code, parse it via the string parser
			return parse(value);
		} else if(typeof value === 'number') {
			// Numbers are treated as a code
			return new Code(String(value));
		}

		throw new Error('Can not convert into code');
	},

	is(value) {
		return value instanceof Code;
	}
};

/**
 * Class that represents a code.
 */
const Code = module.exports.Code = class Code {
	constructor(id, description) {
		this.id = id;
		this.description = description;
	}
};

function parse(value) {
	const idx = value.indexOf(':');
	if(idx >= 0) {
		return new Code(
			value.substring(0, idx).trim(),
			value.substring(idx+1).trim()
		);
	} else {
		return new Code(value.trim());
	}
}
