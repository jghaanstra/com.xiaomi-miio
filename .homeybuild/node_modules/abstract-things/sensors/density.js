'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { number } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'density';
	}

	static availableAPI(builder) {
		builder.event('densityChanged')
			.type('number')
			.description('Density has changed')
			.done();

		builder.action('density')
			.description('Get the current density')
			.getterForState('density')
			.returns('number', 'Current density')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'density' ];
	}

	density() {
		return this.value('density');
	}

	updateDensity(value) {
		this.updateValue('density', number(value));
	}
});
