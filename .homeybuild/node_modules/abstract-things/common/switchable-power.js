'use strict';

const Thing = require('../thing');
const Power = require('./power');
const RestorableState = require('./restorable-state');
const { boolean } = require('../values');

/**
 * Switchable capability, for appliances where the power can be switched on
 * or off.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(Power, RestorableState) {
	/**
	* Define the API of appliances that can manage their power.
	*/
	static availableAPI(builder) {
		builder.action('power')
			.description('Get or set the power state of this appliance')
			.argument('boolean', true, 'Optional power state to change to')
			.returns('boolean', 'The power state of the appliance')
			.getterForState('power')
			.done();

		builder.action('setPower')
			.description('Set the power state of this appliance')
			.argument('boolean', false, 'The power state to change to')
			.returns('boolean', 'The power state of the appliance')
			.done();

		builder.action('togglePower')
			.description('Toggle the power of the appliance, turning it on if off and vice versa')
			.returns('boolean', 'The power state of the appliance')
			.done();

		builder.action('turnOn')
			.description('Turn this appliance on')
			.returns('boolean', 'The power state of the appliance')
			.done();

		builder.action('turnOff')
			.description('Turn this appliance off')
			.returns('boolean', 'The power state of the appliance')
			.done();
	}

	/**
	* Get that this provides the switchable capability.
	*/
	static get capability() {
		return 'switchable-power';
	}

	constructor(...args) {
		super(...args);
	}

	/**
	* Get or switch the power of the appliance.
	*
	* @param {boolean} power
	*   optional power level to switch to
	* @returns
	*   boolean indicating the power level
	*/
	power(power=undefined) {
		if(typeof power !== 'undefined') {
			// Call changePower and then return the new power state
			return this.setPower(power);
		}

		return super.power();
	}

	/**
	 * Set the power of this appliance.
	 *
	 * @param {boolean} power
	 */
	setPower(power) {
		try {
			power = boolean(power);

			return Promise.resolve(this.changePower(power))
				.then(() => this.power());
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	togglePower() {
		return this.power()
			.then(power => this.setPower(! power));
	}

	turnOn() {
		return this.setPower(true);
	}

	turnOff() {
		return this.setPower(false);
	}

	/**
	* Change the current power state of the appliance. This method can return
	* a Promise if the power switching is asynchronous.
	*
	* @param {boolean} power
	*/
	changePower(power) {
		throw new Error('changePower has not been implemented');
	}

	/**
	 * Perform a power change from a state restore. Delegates to `changePower`
	 * but is provided to support smarter state management such as for lights
	 * where this is handled by a custom `setLightState`.
	 *
	 * @param {} power
	 */
	changePowerState(power) {
		return this.changePower(power);
	}

	get restorableState() {
		return [ ...super.restorableState, 'power' ];
	}

	changeState(state) {
		return super.changeState(state)
			.then(() => {
				if(typeof state.power !== 'undefined') {
					return this.changePowerState(state.power);
				}
			});
	}
});
