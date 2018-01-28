'use strict';

const BasicDiscovery = require('./basic');
const { removeService, services, refService, unrefService } = require('./symbols');

const maxStaleTime = Symbol('maxStaleTime');
const timer = Symbol('timer');

module.exports = class ExpiringDiscovery extends BasicDiscovery {
	constructor(options) {
		if(! options) throw new Error('options must be specified');
		if(! options.maxStaleTime || options.maxStaleTime <= 0) throw new Error('maxStaleTime option is required and needs to be a positive number');

		super();

		this[maxStaleTime] = options.maxStaleTime;
	}

	start() {
		super.start();

		// Run expiration at a regular interval
		this[timer] = setInterval(() => {
			// The oldest a service can be to not be removed
			const oldest = Date.now() - this[maxStaleTime];

			for(const service of this[services].values()) {
				if(service.lastSeen < oldest && ! service.ref) {
					// This service is to old, remove it
					this[removeService](service.data);
				}
			}
		}, Math.max(1000, this[maxStaleTime] / 3));
	}

	stop() {
		clearInterval(this[timer]);

		super.stop();
	}

	[refService](service) {
		const id = typeof service === 'string' ? service : service.id;
		const registration = this[services].get(id);
		if(registration) {
			registration.ref = true;
		}
	}

	[unrefService](service) {
		const id = typeof service === 'string' ? service : service.id;
		const registration = this[services].get(id);
		if(registration) {
			registration.ref = false;
		}
	}
};
