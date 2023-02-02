'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { energy } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'power-consumed';
	}

	static availableAPI(builder) {
		builder.event('powerConsumedChanged')
			.type('energy')
			.description('The amount of power consumed')
			.done();

		builder.action('powerConsumed')
			.description('Get the amount of power consumed')
			.getterForState('powerConsumed')
			.returns('energy', 'Amount of power consumed')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'powerConsumed' ];
	}

	powerConsumed() {
		return this.value('powerConsumed');
	}

	updatePowerConsumed(value) {
		this.updateValue('powerConsumed', energy(value));
	}
});
