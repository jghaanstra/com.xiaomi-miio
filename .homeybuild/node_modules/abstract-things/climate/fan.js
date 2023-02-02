'use strict';

const Thing = require('../thing');

/**
 * Fan.
 */
module.exports = Thing.type(Parent => class extends Parent {
	static get type() {
		return 'fan';
	}
});
