'use strict';

module.exports = class Code {
	constructor(id, description) {
		this.id = id;
		this.description = description;
	}

	static parse(value) {
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
};
