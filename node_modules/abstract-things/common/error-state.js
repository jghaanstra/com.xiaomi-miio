'use strict';

const Thing = require('../thing');
const State = require('./state');
const { code } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {

	static availableAPI(builder) {
		builder.state('error')
			.type('string')
			.description('Error code, or null if no error')
			.done();

		builder.event('errorChanged')
			.type('code')
			.description('If the current error code changes')
			.done();

		builder.event('error')
			.type('code')
			.description('Thing has encountered an error')
			.done();

		builder.event('errorCleared')
			.description('Error of thing has been cleared')
			.done();

		builder.action('error')
			.description('Get the current error state')
			.returns('code', 'The current error state or null if no error')
			.done();
	}

	static get capability() {
		return 'error-state';
	}

	constructor(...args) {
		super(...args);

		this.updateState('error', null);
	}

	/**
	 * Get if thing has an error.
	 */
	get error() {
		return Promise.resolve(this.getState('error'));
	}

	updateError(error) {
		if(error) {
			error = code(error);
		} else {
			error = null;
		}

		if(this.updateState('error', error)) {
			this.emitEvent('errorChanged', error);

			if(error) {
				this.emitEvent('error', error);
			} else {
				this.emitEvent('errorCleared');
			}
		}
	}
});
