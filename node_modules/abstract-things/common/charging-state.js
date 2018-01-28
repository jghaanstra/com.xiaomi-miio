'use strict';

const Thing = require('../thing');
const State = require('./state');
const { boolean } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {

	static availableAPI(builder) {
		builder.state('charging')
			.type('boolean')
			.description('If the thing is charging')
			.done();

		builder.event('chargingChanged')
			.type('boolean')
			.description('Charging state of the thing has changed')
			.done();

		builder.event('chargingStarted')
			.description('Charging has started')
			.done();

		builder.event('chargingStoppped')
			.description('Charging has stopped')
			.done();

		builder.action('charging')
			.description('Get charging state')
			.returns('boolean', 'If thing is charging')
			.done();
	}

	static get capability() {
		return 'charging-state';
	}

	constructor(...args) {
		super(...args);

		this.updateState('charging', false);
	}

	/**
	 * Get if thing is charging.
	 */
	get charging() {
		return Promise.resolve(this.getState('charging'));
	}

	updateCharging(charging) {
		charging = boolean(charging);
		if(this.updateState('charging', charging)) {
			this.emitEvent('chargingChanged', charging);

			if(charging) {
				this.emitEvent('chargingStarted');
			} else {
				this.emitEvent('chargingStopped');
			}
		}
	}
});
