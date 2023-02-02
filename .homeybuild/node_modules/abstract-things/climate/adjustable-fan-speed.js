'use strict';

const Thing = require('../thing');
const FanSpeed = require('./fan-speed');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(FanSpeed) {

	static get capability() {
		return 'adjustable-fan-speed';
	}

	static availableAPI(builder) {
		builder.action('fanSpeed')
			.description('Get or set the fan speed')
			.argument('percentage', true, 'Optional fan speed to set')
			.returns('percentage', 'The fan speed')
			.done();
	}

	fanSpeed(speed) {
		if(typeof speed === 'undefined') {
			return super.fanSpeed();
		}

		return this.setFanSpeed(speed);
	}

	setFanSpeed(speed) {
		speed = percentage(speed, true);

		try {
			return Promise.resolve(this.changeFanSpeed(speed))
				.then(() => super.fanSpeed());
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	changeFanSpeed(speed) {
		throw new Error('changeFanSpeed not implemented');
	}

});
