'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { number } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'carbon-monoxide';
	}

	static availableAPI(builder) {
		builder.event('carbonMonoxideChanged')
			.type('number')
			.description('Carbon monoxide level has changed')
			.done();

		builder.action('carbonMonoxide')
			.description('Get the current carbon monoxide level')
			.getterForState('carbonMonoxide')
			.returns('number', 'Current carbon monoxide level')
			.done();

		builder.action('co')
			.description('Get the current carbon monoxide level')
			.getterForState('carbonMonoxide')
			.returns('number', 'Current carbon monoxide level')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'carbonMonoxide' ];
	}

	carbonMonoxide() {
		return this.value('carbonMonoxide');
	}

	co() {
		return this.value('carbonMonoxide');
	}

	updateCarbonMonoxide(value) {
		this.updateValue('carbonMonoxide', number(value));
	}
});
