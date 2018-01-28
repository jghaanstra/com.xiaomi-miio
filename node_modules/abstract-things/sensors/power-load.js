'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { power } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'power-load';
	}

	static availableAPI(builder) {
		builder.event('powerLoadChanged')
			.type('power')
			.description('The power load has changed')
			.done();

		builder.action('powerLoad')
			.description('Get the current power load')
			.getterForState('powerLoad')
			.returns('power', 'Current power load')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'powerLoad' ];
	}

	powerLoad() {
		return this.value('powerLoad');
	}

	updatePowerLoad(value) {
		this.updateValue('powerLoad', power(value));
	}
});
