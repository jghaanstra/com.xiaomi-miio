'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { pressure } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'atmospheric-pressure';
	}

	static availableAPI(builder) {
		builder.event('atmosphericPressureChanged')
			.type('pressure')
			.description('Current atmospheric pressure has changed')
			.done();

		builder.action('atmosphericPressure')
			.description('Get the current atmospheric pressure')
			.getterForState('pressure')
			.returns('pressure', 'Current atmospheric pressure')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'atmosphericPressure' ];
	}

	get atmosphericPressure() {
		return this.value('atmosphericPressure');
	}

	updateAtmosphericPressure(value) {
		this.updateValue('atmosphericPressure', pressure(value));
	}
});
