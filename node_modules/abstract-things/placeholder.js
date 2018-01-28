'use strict';

const Thing = require('./thing');

/**
 * Mixin used to mark things as placeholders. A placeholder is a thing
 * that needs some configuration or authentication before it is usable.
 */
module.exports = Thing.mixin(Parent => class extends Parent {
	static get type() {
		return 'placeholder';
	}
});
