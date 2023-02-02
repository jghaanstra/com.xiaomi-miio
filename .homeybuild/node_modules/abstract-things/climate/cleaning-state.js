'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const ErrorState = require('../common/error-state');
const { boolean } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(ErrorState, State) {

	static get capability() {
		return 'cleaning-state';
	}

	static availableAPI(builder) {
		builder.state('cleaning')
			.type('boolean')
			.description('If the thing is currently cleaning')
			.done();

		builder.event('cleaningChanged')
			.type('boolean')
			.description('Cleaning state of the thing has changed')
			.done();

		builder.event('cleaningStarted')
			.description('Cleaning has started')
			.done();

		builder.event('cleaningDone')
			.description('Cleaning is done without any errors')
			.done();

		builder.event('cleaningError')
			.description('Error encountered during cleaning')
			.done();

		builder.event('cleaningStoppped')
			.description('Cleaning has stopped')
			.done();

		builder.action('cleaning')
			.description('Get the cleaning state')
			.returns('boolean', 'If thing is currently cleaning')
			.done();
	}

	constructor(...args) {
		super(...args);

		this.updateState('cleaning', false);
	}

	/**
	 * Get if thing is cleaning.
	 */
	cleaning() {
		return Promise.resolve(this.getState('cleaning'));
	}

	updateCleaning(cleaning) {
		cleaning = boolean(cleaning);
		if(this.updateState('cleaning', cleaning)) {
			this.emitEvent('cleaningChanged', cleaning);

			if(cleaning) {
				this.emitEvent('cleaningStarted');
			} else {

				if(this.error !== null) {
					// If an error has been encountered
					this.emitEvent('cleaningDone');
				} else {
					// Emit a special error event if error occurred during cleaning
					this.emitEvent('cleaningError', this.error);
				}

				this.emitEvent('cleaningStopped');
			}
		}
	}

	updateError(error) {
		// Update error state
		super.updateError(error);

		// Make sure to update as not cleaning anymore
		this.updateCleaning(false);
	}
});
