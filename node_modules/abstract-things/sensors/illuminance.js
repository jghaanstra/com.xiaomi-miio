'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { illuminance } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'illuminance';
	}

	static availableAPI(builder) {
		builder.event('illuminanceChanged')
			.type('illuminance')
			.description('Current illuminance has changed')
			.done();

		builder.action('illuminance')
			.description('Get the current illuminance')
			.getterForState('illuminance')
			.returns('illuminance', 'Current illuminance')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'illuminance' ];
	}

	illuminance() {
		return this.value('illuminance');
	}

	updateIlluminance(value) {
		this.updateValue('illuminance', illuminance(value));
	}
});
