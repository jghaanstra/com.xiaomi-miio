'use strict';

const Thing = require('../thing');

/**
 * Marker for lights that support a full color range.
 */
module.exports = Thing.mixin(Parent => class extends Parent {
	static get capability() {
		return 'color:full';
	}
});
