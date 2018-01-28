'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { number } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'pm10';
	}

	static availableAPI(builder) {
		builder.event('pm10Changed')
			.type('number')
			.description('PM10 density has changed')
			.done();

		builder.action('pm10')
			.description('Get the current PM10 density')
			.getterForState('pm10')
			.returns('number', 'Current PM10 density')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'pm10' ];
	}

	pm10() {
		return this.value('pm10');
	}

	updatePM10(value) {
		this.updateValue('pm10', number(value));
	}
});
