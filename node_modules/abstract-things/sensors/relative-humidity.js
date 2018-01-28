'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'relative-humidity';
	}

	static availableAPI(builder) {
		builder.event('relativeHumidityChanged')
			.type('percentage')
			.description('Current relative humidity has changed')
			.done();

		builder.action('relativeHumidity')
			.description('Get the current relative humidity')
			.getterForState('relativeHumidity')
			.returns('percentage', 'Current relative humidity')
			.done();

		builder.action('rh')
			.description('Get the current relative humidity')
			.getterForState('relativeHumidity')
			.returns('percentage', 'Current relative humidity')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'relativeHumidity' ];
	}

	relativeHumidity() {
		return this.value('relativeHumidity');
	}

	rh() {
		return this.value('relativeHumidity');
	}

	updateRelativeHumidity(value) {
		this.updateValue('relativeHumidity', percentage(value));
	}
});
