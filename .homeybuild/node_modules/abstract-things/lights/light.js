'use strict';

const Thing = require('../thing');
const { duration } = require('../values');

module.exports = Thing.type(Parent => class extends Parent {
	/**
	 * Mark appliance as a `light`.
	 */
	static get type() {
		return 'light';
	}

	static get availableAPI() {
		return [];
	}
});

/**
 * Default duration for transitions of things such as brightness and color.
 */
module.exports.DURATION = duration(400);
