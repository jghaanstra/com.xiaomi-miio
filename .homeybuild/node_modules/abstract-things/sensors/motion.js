'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { boolean, duration } = require('../values');
const idleTimer = Symbol('autoIdle');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
	static get capability() {
		return 'motion';
	}

	static availableAPI(builder) {
		builder.event('motionChanged')
			.type('boolean')
			.description('Change in detected motion')
			.done();

		builder.event('movement')
			.description('Movement has been detected')
			.done();

		builder.event('inactivity')
			.description('Inactivity has been detected, no motion detected')
			.done();

		builder.action('motion')
			.description('Get if motion is currently detected')
			.getterForState('motion')
			.returns('boolean', 'Current motion detected status')
			.done();
	}

	get sensorTypes() {
		return [ ...super.sensorTypes, 'motion' ];
	}

	motion() {
		return this.value('motion');
	}

	updateMotion(motion, autoIdleTimeout=null) {
		motion = boolean(motion);
		if(this.updateValue('motion', motion)) {
			if(motion) {
				// Emit the movement event if movement is detected
				this.emitEvent('movement');
			} else {
				// Emit the inactivity event if no movement is being detected
				this.emitEvent('inactivity');
			}
		}

		// Always clear the idle timer
		clearTimeout(this[idleTimer]);

		if(motion && autoIdleTimeout) {
			/*
			 * When motion has been detected and automatic idle is requested
			 * set a timer.
			 */
			const ms = duration(autoIdleTimeout).ms;
			this[idleTimer] = setTimeout(() => this.updateMotion(false), ms);
		}
	}
});
