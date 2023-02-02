'use strict';

const Thing = require('../thing');
const State = require('../common/state');

module.exports = Thing.type(Parent => class extends Parent.with(State) {
	/**
	 * Mark appliance as a `sensor`.
	 */
	static get type() {
		return 'sensor';
	}

	static availableAPI(builder) {
		builder.action('values')
			.description('Get all sensor values')
			.returns('object')
			.done();
	}

	value(sensorType) {
		return Promise.resolve(this.getState(sensorType));
	}

	get sensorTypes() {
		return [];
	}

	values() {
		const result = {};
		for(const type of this.sensorTypes) {
			result[type] = this.getState(type);
		}
		return Promise.resolve(result);
	}

	updateValue(sensorType, value) {
		if(this.updateState(sensorType, value)) {
			this.emitEvent(sensorType + 'Changed', value);
			return true;
		} else {
			return false;
		}
	}
});
