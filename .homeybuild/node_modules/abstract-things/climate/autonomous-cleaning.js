'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const CleaningState = require('./cleaning-state');

module.exports = Thing.mixin(Parent => class extends Parent.with(State, CleaningState) {

	static get capability() {
		return 'autonomous-cleaning';
	}

	static availableAPI(builder) {
		builder.action('clean')
			.description('Start cleaning')
			.done();

		builder.action('stop')
			.description('Stop cleaning')
			.done();
	}

	clean() {
		try {
			return Promise.resolve(this.activateCleaning())
				.then(() => null);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	stop() {
		try {
			return Promise.resolve(this.deactivateCleaning())
				.then(() => null);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	activateCleaning() {
		throw new Error('activateCleaning not implemented');
	}

	deactivateCleaning() {
		throw new Error('deactivateCleaning not implemented');
	}
});
