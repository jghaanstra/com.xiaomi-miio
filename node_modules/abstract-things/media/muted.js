'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const { boolean } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'audio-muted';
	}

	static availableAPI(builder) {
		builder.event('mutedChanged')
			.type('boolean')
			.description('Current mute status has changed')
			.done();

		builder.event('muted')
			.description('Audio has been muted')
			.done();

		builder.event('unmuted')
			.description('Audio has been unmuted')
			.done();

		builder.action('muted')
			.description('Get if currently muted')
			.returns('boolean', 'Current mute status')
			.done();
	}

	muted() {
		return Promise.resolve(this.getState('muted'));
	}

	updateMuted(muted) {
		muted = boolean(muted);

		if(this.updateState('muted', muted)) {
			this.emitEvent('mutedChanged', muted);

			if(muted) {
				this.emitEvent('muted');
			} else {
				this.emitEvent('umuted');
			}
		}
	}
});
