'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {

	static get capability() {
		return 'fan-speed';
	}

	static availableAPI(builder) {
		builder.event('fanSpeedChanged')
			.type('percentage')
			.description('The fan speed has changed')
			.done();

		builder.action('fanSpeed')
			.description('Get the fan speed')
			.returns('percentage', 'Current fan speed')
			.done();
	}

	fanSpeed() {
		return Promise.resolve(this.getState('fanSpeed'));
	}

	updateFanSpeed(fanSpeed) {
		fanSpeed = percentage(fanSpeed);

		if(this.updateState('fanSpeed', fanSpeed)) {
			this.emitEvent('fanSpeedChanged', fanSpeed);
		}
	}
});
