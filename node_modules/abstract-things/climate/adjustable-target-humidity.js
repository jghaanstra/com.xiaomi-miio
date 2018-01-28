'use strict';

const Thing = require('../thing');
const TargetHumidity = require('./target-humidity');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(TargetHumidity) {

	static get capability() {
		return 'adjustable-target-humidity';
	}

	static availableAPI(builder) {
		builder.action('targetHumidity')
			.description('Get or set the target humidity')
			.argument('percentage', true, 'Optional target humidity to set')
			.returns('percentage', 'The current or set target humidity')
			.done();

		builder.action('setTargetHumidity')
			.description('Set the target humidity')
			.argument('percentage', false, 'Target humidity to set')
			.returns('percentage', 'The target humidity')
			.done();
	}

	targetHumidity(humidity) {
		if(typeof humidity === 'undefined') {
			return super.targetHumidity();
		}

		return this.setTargetHumidity(humidity);
	}

	setTargetHumidity(humidity) {
		try {
			humidity = percentage(humidity, true);

			return Promise.resolve(this.changeTargetHumidity(humidity))
				.then(() => super.targetHumidity());
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	changeTargetHumidity(humidity) {
		throw new Error('changeTargetHumidity not implemented');
	}

});
