'use strict';

const Thing = require('../thing');
const Mode = require('./mode');

/**
 * Switchable mode capability.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(Mode) {
	/**
	* Define the API of appliances that can manage their mode.
	*/
	static availableAPI(builder) {
		builder.action('mode')
			.description('Get or set the mode of this appliance')
			.argument('string', true, 'Optional mode to change to')
			.returns('mode', 'The mode of the appliance')
			.getterForState('mode')
			.done();

		builder.action('setMode')
			.description('Set the mode of this appliance')
			.argument('string', true, 'Mode to change to')
			.returns('mode', 'The mode of the appliance')
			.done();
	}

	/**
	* Get that this provides the switchable capability.
	*/
	static get capability() {
		return 'switchable-mode';
	}

	constructor(...args) {
		super(...args);
	}

	/**
	* Get or switch the mode of the appliance.
	*
	* @param {string} mode
	*   optional mode to switch to
	* @returns
	*   string indicating the mode
	*/
	mode(mode=undefined) {
		if(typeof mode !== 'undefined') {
			return this.setMode(mode);
		}

		return super.mode();
	}

	/**
	* Set the mode of this appliance.
	*
	* @param {string} mode
	*/
	setMode(mode) {
		try {
			if(typeof mode === 'undefined') throw new Error('Mode must be specified');
			mode = String(mode);

			return Promise.resolve(this.changeMode(mode))
				.then(() => this.getState('mode'));
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	/**
	* Change the current mode of the device.
	*
	* @param {mode} mode
	*/
	changeMode(mode) {
		throw new Error('changeMode has not been implemented');
	}
});
