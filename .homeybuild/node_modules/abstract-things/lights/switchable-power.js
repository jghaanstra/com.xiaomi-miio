'use strict';

const Thing = require('../thing');
const SwitchablePower = require('../common/switchable-power');
const LightState = require('./light-state');
const { boolean } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(SwitchablePower, LightState) {

	changePowerState(state) {
		// Do nothing, setLightState handles power changes instead
	}

	setLightState(state) {
		return super.setLightState(state)
			.then(() => {
				if(typeof state.power !== 'undefined') {
					return this.changePower(state.power);
				}
			});
	}

	mapLightState(state) {
		super.mapLightState(state);

		if(typeof state.power !== 'undefined') {
			state.power = boolean(state.power);
		}
	}
});
