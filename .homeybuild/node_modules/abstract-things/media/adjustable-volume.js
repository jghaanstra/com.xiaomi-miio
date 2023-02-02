'use strict';

const Thing = require('../thing');
const Volume = require('./volume');
const { percentage, 'percentage:change': change } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Volume) {
	static get capability() {
		return 'adjustable-audio-volume';
	}

	static availableAPI(builder) {
		builder.action('volume')
			.description('Get or set the volume level as a percentage between 0 and 100')
			.argument('percentage:change', true, 'Optional volume to set')
			.returns('percentage', 'The volume level')
			.done();

		builder.action('setVolume')
			.description('Set the volume')
			.argument('percentage', false, 'The volume to set')
			.returns('percentage', 'The volume level')
			.done();

		builder.action('increaseVolume')
			.description('Increase the volume')
			.argument('percentage', false, 'The amount to increase the volume')
			.returns('percentage', 'The volume level')
			.done();

		builder.action('decreaseVolume')
			.description('Decrease the volume')
			.argument('percentage', false, 'The amount to decrease the volume')
			.returns('percentage', 'The volume level')
			.done();
	}

	volume(volume) {
		try {
			let currentVolume = this.getState('volume');

			if(typeof volume !== 'undefined') {
				volume = change(volume);

				let toSet;
				if(volume.isIncrease) {
					toSet = currentVolume + volume.value;
				} else if(volume.isDecrease) {
					toSet = currentVolume - volume.value;
				} else {
					toSet = volume.value;
				}

				return this.setVolume(toSet);
			}

			return Promise.resolve(currentVolume);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	increaseVolume(amount) {
		return this.setVolume(Math.min(100, this.state.volume + amount));
	}

	decreaseVolume(amount) {
		return this.setVolume(Math.max(0, this.state.volume - amount));
	}

	setVolume(volume) {
		try {
			volume = percentage(volume, { min: 0, max: 100 });

			return Promise.resolve(this.changeVolume(volume))
				.then(() => this.state.volume);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	changeVolume(volume) {
		throw new Error('changeVolume has not been implemented');
	}
});
