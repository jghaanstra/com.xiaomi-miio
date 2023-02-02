'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const ChargingState = require('./charging-state');

module.exports = Thing.mixin(Parent => class extends Parent.with(State, ChargingState) {

	static get capability() {
		return 'autonomous-cleaning';
	}

	static availableAPI(builder) {
		builder.action('charge')
			.description('Start charging thing')
			.done();
	}

	charge() {
		try {
			return Promise.resolve(this.activateCharging())
				.then(() => null);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	activateCharging() {
		throw new Error('activateCharging not implemented');
	}

});
