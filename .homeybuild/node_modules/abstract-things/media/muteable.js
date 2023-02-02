'use strict';

const Thing = require('../thing');
const Muted = require('./muted');
const { boolean } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Muted) {
	static get capability() {
		return 'audio-muteable';
	}

	static availableAPI(builder) {
		builder.action('muted')
			.description('Get or set if currently muted')
			.argument('boolean', true, 'Optional mute status to set')
			.returns('boolean', 'Current mute status')
			.done();

		builder.action('setMuted')
			.description('Set if audio is muted')
			.argument('boolean', false, 'If the audio is muted')
			.returns('boolean', 'Current mute status')
			.done();

		builder.action('mute')
			.description('Mute the audio')
			.returns('boolean', 'The new muted state')
			.done();

		builder.action('unmute')
			.description('Unmute the audio')
			.returns('boolean', 'The new muted state')
			.done();

		builder.action('toggleMuted')
			.description('Toggle the current muted state')
			.done();
	}

	muted(muted) {
		if(typeof muted === 'undefined') {
			return super.muted();
		}

		return this.setMuted(muted);
	}

	setMuted(muted) {
		try {
			muted = boolean(muted, true, 'Boolean for new muted state is required');

			return Promise.resolve(this.changeMuted(muted))
				.then(() => this.state.muted);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	mute() {
		return this.setMuted(true);
	}

	unmute() {
		return this.setMuted(false);
	}

	toggleMuted() {
		return this.muted()
			.then(muted => this.setMuted(! muted));
	}

	changeMuted(muted) {
		throw new Error('changeMuted has not been implemented');
	}
});
