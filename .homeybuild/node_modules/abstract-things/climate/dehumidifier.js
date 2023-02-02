'use strict';

const Thing = require('../thing');

/**
 * Type for marking things that are dehumidifiers.
 */
module.exports = Thing.type(Parent => class extends Parent {
	static get type() {
		return 'dehumidifer';
	}
});
