'use strict';

const Thing = require('../thing');
const State = require('./state');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {

	static availableAPI(builder) {
		builder.state('batteryLevel')
			.type('percentage')
			.description('Current battery level of the appliance')
			.done();

		builder.event('batteryLevelChanged')
			.type('percentage')
			.description('Battery level of the appliance has changed')
			.done();

		builder.action('batteryLevel')
			.description('Get the battery level of the appliance')
			.returns('percentage', 'Current battery level')
			.done();
	}

	static get capability() {
		return 'battery-level';
	}

	constructor(...args) {
		super(...args);

		this.updateState('batteryLevel', -1);
	}

	batteryLevel() {
		return Promise.resolve(this.getState('batteryLevel'));
	}

	updateBatteryLevel(level) {
		level = percentage(level);
		if(this.updateState('batteryLevel', level)) {
			this.emitEvent('batteryLevelChanged', level);
		}
	}
});
