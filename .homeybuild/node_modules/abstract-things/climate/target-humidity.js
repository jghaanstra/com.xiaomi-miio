'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {

	static get capability() {
		return 'target-humidity';
	}

	static availableAPI(builder) {
		builder.event('targetHumidityChanged')
			.type('percentage')
			.description('The target humidity (relative) has changed')
			.done();

		builder.action('targetHumidity')
			.description('Get the target humidity')
			.returns('percentage', 'The target humidity')
			.done();
	}

	targetHumidity() {
		return Promise.resolve(this.getState('targetHumidity'));
	}

	updateTargetHumidity(target) {
		target = percentage(target);

		if(this.updateState('targetHumidity', target)) {
			this.emitEvent('targetHumidityChanged', target);
		}
	}
});
