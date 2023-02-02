'use strict';

const Thing = require('../thing');
const Light = require('./light');
const LightState = require('./light-state');
const Brightness = require('./brightness');
const { boolean, duration, percentage, 'percentage:change': change } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Brightness, LightState) {
	/**
	 * Expose the brightness API.
	 */
	static availableAPI(builder) {
		builder.action('brightness')
			.description('Get or set the brightness of this light')
			.argument('percentage:change', true, 'The change in brightness or absolute brightness')
			.returns('percentage', 'The brightness of the light')
			.getterForState('brightness')
			.done();

		builder.action('setBrightness')
			.description('Set the brightness of this light')
			.argument('percentage', false, 'The brightness to set')
			.returns('percentage', 'The brightness of the light')
			.done();

		builder.action('increaseBrightness')
			.description('Increase the brightness of this light')
			.argument('percentage', false, 'The amount to increase the brightness')
			.returns('percentage', 'The brightness of the light')
			.done();

		builder.action('decreaseBrightness')
			.description('Decrease the brightness of this light')
			.argument('percentage', false, 'The amount to decrease the brightness')
			.returns('percentage', 'The brightness of the light')
			.done();
	}

	/**
	 * Mark the light as dimmable.
	 */
	static get capabilities() {
		return [ 'dimmable' ];
	}

	/**
	 * Get or change the brightness of this light.
	 */
	brightness(brightness, duration=Light.DURATION) {
		try {
			let currentBrightness = this.getState('brightness', 0);

			if(typeof brightness !== 'undefined') {
				brightness = change(brightness);

				let powerOn = true;
				let toSet;
				if(brightness.isIncrease) {
					toSet = currentBrightness + brightness.value;
				} else if(brightness.isDecrease) {
					toSet = currentBrightness - brightness.value;
					powerOn = false;
				} else {
					toSet = brightness.value;
				}

				return this.setBrightness(toSet, duration, powerOn);
			}

			return Promise.resolve(currentBrightness);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	increaseBrightness(amount, duration=Light.DURATION) {
		return this.setBrightness(Math.min(100, this.state.brightness + amount), duration, true);
	}

	decreaseBrightness(amount, duration=Light.DURATION) {
		return this.setBrightness(Math.max(0, this.state.brightness - amount), duration, false);
	}

	setBrightness(brightness, duration0=Light.DURATION, powerOn=true) {
		try {
			if(typeof brightness === 'undefined') throw new Error('Brightness must be specified');
			brightness = percentage(brightness, { min: 0, max: 100 });

			const options = {
				duration: duration(duration0),
				powerOn: brightness <= 0 ? false : boolean(powerOn)
			};

			return Promise.resolve(this.changeBrightness(brightness, options))
				.then(() => this.getState('brightness', 0));
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	/**
	 * Change the brightness of this light. Should change the brightness of the light and
	 * call `updateBrightness` with the brightness that has actually been set.
	 *
	 * @param {number} brightness
	 * @param {object} options
	 *   the options to apply. Currently available:
	 *
	 *   * duration: Duration of change if this light supports timing.
	 *   * powerOn: Boolean indcating if the power should be switched on.
	 */
	changeBrightness(brightness, options) {
		throw new Error('changeBrightness not implemented');
	}

	get restorableState() {
		return [ ...super.restorableState, 'brightness' ];
	}

	setLightState(state) {
		return super.setLightState(state)
			.then(() => {
				if(typeof state.brightness !== 'undefined') {
					const options = {
						duration: Light.DURATION,
						powerOn: typeof state.power !== 'undefined' ? state.power : true
					};
					return this.changeBrightness(state.brightness, options);
				}
			});
	}

	mapLightState(state) {
		super.mapLightState(state);

		if(typeof state.brightness !== 'undefined') {
			state.brightness = percentage(state.brightness);
		}
	}
});
