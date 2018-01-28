'use strict';

const Thing = require('./thing');
const { duration } = require('./values');

const pollDuration = Symbol('pollDuration');
const pollTimer = Symbol('pollTimer');
const maxPollFailures = Symbol('maxpollFailures');
const pollFailures = Symbol('pollFailures');

module.exports = Thing.mixin(Parent => class extends Parent {

	constructor(...args) {
		super(...args);

		this[pollDuration] = 30000;
		this.internalPoll = this.internalPoll.bind(this);
		this[maxPollFailures] = -1;
		this[pollFailures] = 0;
	}

	updatePollDuration(time) {
		time = this[pollDuration] = duration(time).ms;

		if(this[pollTimer]) {
			clearTimeout(this[pollTimer]);

			this[pollTimer] = setTimeout(this.internalPoll, time);
		}
	}

	updateMaxPollFailures(failures) {
		this[maxPollFailures] = failures;
	}

	initCallback() {
		return super.initCallback()
			.then(() => {
				// During initalization a single poll is performed
				return this.internalPoll(true);
			});
	}

	destroyCallback() {
		return super.destroyCallback()
			.then(() => clearTimeout(this[pollTimer]));
	}

	internalPoll(isInitial=false) {
		const time = Date.now();

		// Perform poll async - and schedule new poll after it has resolved
		return Promise.resolve(this.poll(isInitial))
			.catch(ex => {
				this.debug('Could not poll:', ex);
				return new Error('Polling issue');
			})
			.then(r => {
				// Check if failure
				if(r instanceof Error) {
					this[pollFailures]++;
					if(this[maxPollFailures] > 0 && this[maxPollFailures] <= this[pollFailures]) {
						/*
						 * The maximum number of failures in a row have been
						 * reached. Destroy this thing.
						 */
						this.destroy();
					}
				} else {
					this[pollFailures] = 0;
				}

				// Schedule the next poll
				const diff = Date.now() - time;
				const d = this[pollDuration];

				let nextTime = d - diff;
				while(nextTime < 0) {
					nextTime += d;
				}

				this[pollTimer] = setTimeout(this.internalPoll, nextTime);
			});
	}

	poll(isInitial) {
		throw new Error('Poll has not been implemented');
	}
});
