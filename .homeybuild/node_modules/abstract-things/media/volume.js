'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const { percentage } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'audio-volume';
	}

	static availableAPI(builder) {
		builder.event('volumeChanged')
			.type('percentage')
			.description('Current volume has changed')
			.done();

		builder.action('volume')
			.description('Get the volume level as a percentage between 0 and 100')
			.returns('percentage', 'Current volume')
			.done();
	}

	volume() {
		return Promise.resolve(this.getState('volume'));
	}

	updateVolume(volume) {
		volume = percentage(volume, { min: 0, max: 100, precision: 1 });

		if(this.updateState('volume', volume)) {
			this.emitEvent('volumeChanged', volume);
		}
	}
});
