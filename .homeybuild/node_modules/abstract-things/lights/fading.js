'use strict';

const Thing = require('../thing');
const { duration } = require('../values');

const maxChangeTime = Symbol('maxChangeTime');

/**
 * Marker for lights that support fading effects for dimming and color
 * changing.
 */
module.exports = Thing.mixin(Parent => class extends Parent {
	static get capability() {
		return 'fading';
	}

	static availableAPI(builder) {
		builder.action('maxChangeTime')
			.description('Get the maximum duration a change can occur over')
			.returns('duration')
			.done();
	}

	maxChangeTime() {
		return Promise.resolve(this[maxChangeTime]);
	}

	updateMaxChangeTime(t) {
		this[maxChangeTime] = duration(t);
	}
});
