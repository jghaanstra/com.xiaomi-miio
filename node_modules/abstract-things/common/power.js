'use strict';

const Thing = require('../thing');
const State = require('./state');

/**
 * Power capability, for appliances that support switching and monitoring the
 * power status of themselves.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	/**
	* Define the API of appliances that can manage their power.
	*/
	static availableAPI(builder) {
		builder.state('power')
			.type('boolean')
			.description('The power state of this appliance')
			.done();

		builder.event('powerChanged')
			.type('boolean')
			.description('The power state of the appliance has changed')
			.done();

		builder.action('power')
			.description('Get the power state of this appliance')
			.returns('boolean', 'The power state of the appliance')
			.getterForState('power')
			.done();
	}

	/**
	* Get that this provides the power capability.
	*/
	static get capability() {
		return 'power';
	}

	constructor(...args) {
		super(...args);

		this.updateState('power', false);
	}

	/**
	* Get the power state of this appliance.
	*
	* @returns
	*   boolean indicating the power level
	*/
	power() {
		return Promise.resolve(this.getState('power'));
	}

	/**
	* Update the state of power to the appliance. Implementations should call
	* this whenever the power changes, either from an external event or when
	* changePower is called.
	*
	* @param {boolean} power
	*/
	updatePower(power) {
		if(this.updateState('power', power)) {
			this.emitEvent('powerChanged', power);
		}
	}

});
