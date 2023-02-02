'use strict';

const Thing = require('../thing');

/**
 * Air Monitor.
 */
module.exports = Thing.type(Parent => class extends Parent {
	static get type() {
		return 'air-monitor';
	}
});
