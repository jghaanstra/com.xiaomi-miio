'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { temperature } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'temperature';
	}

	static availableAPI(builder) {
		builder.event('temperatureChanged')
			.type('temperature')
			.description('Current temperature has changed')
			.done();

		builder.action('temperature')
			.description('Get the current temperature')
			.getterForState('temperature')
			.returns('temperature', 'Current temperature')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'temperature' ];
	}

	temperature() {
		return this.value('temperature');
	}

	updateTemperature(temp) {
		this.updateValue('temperature', temperature(temp));
	}
});
