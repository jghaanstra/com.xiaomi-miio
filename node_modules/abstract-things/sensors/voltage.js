'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { voltage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'voltage';
	}

	static availableAPI(builder) {
		builder.event('voltageChanged')
			.type('voltage')
			.description('Measured voltage changed')
			.done();

		builder.action('voltage')
			.description('Get the current measured voltage')
			.getterForState('voltage')
			.returns('voltage', 'Current measured voltage')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'voltage' ];
	}

	voltage() {
		return this.value('voltage');
	}

	updateVoltage(value) {
		this.updateValue('voltage', voltage(value));
	}
});
