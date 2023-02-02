'use strict';

const Thing = require('../thing');

/**
 * Air Purifier.
 */
module.exports = Thing.type(Parent => class extends Parent {
	static get type() {
		return 'air-purifier';
	}
});
