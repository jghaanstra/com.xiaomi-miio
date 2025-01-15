'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const CleaningState = require('./cleaning-state');

module.exports = Thing.mixin(Parent => class extends Parent.with(State, CleaningState) {

	static get capability() {
		return 'spot-cleaning';
	}

	static availableAPI(builder) {
		builder.action('cleanSpot')
			.description('Request that the thing performs spot cleaning')
			.done();
	}

	cleanSpot() {
		try {
			return Promise.resolve(this.activateCleanSpot())
				.then(() => null);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	activateCleanSpot() {
		throw new Error('activateCleanSpot not implemented');
	}

});
