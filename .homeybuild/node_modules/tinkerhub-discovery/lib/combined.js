'use strict';

const BasicDiscovery = require('./basic');

const { addService, removeService, parent, services } = require('./symbols');
const available = Symbol('available');
const unavailable = Symbol('unavailable');

/**
 * Combine serveral discovery instances into one.
 */
module.exports = class CombinedDiscovery extends BasicDiscovery {
	static get type() {
		return 'combined';
	}

	constructor(instances) {
		super();

		this[parent] = instances;

		this[available] = this[available].bind(this);
		this[unavailable] = this[unavailable].bind(this);

		for(const instance of this[parent]) {
			if(instance.active) {
				// Make sure we start if we are being filtered on an already started discovery
				instance.on('available', this[available]);
				instance.on('unavailable', this[unavailable]);

				for(const service of instance.services) {
					this[addService](service);
				}
			}
		}
	}

	/**
	 * Start the discovery.
	 */
	start() {
		// Start each instance and register listeners
		for(const instance of this[parent]) {
			if(! instance.active) {
				instance.start();

				instance.on('available', this[available]);
				instance.on('unavailable', this[unavailable]);
			}
		}

		super.start();
	}

	/**
	 * Stop the discovery.
	 */
	stop() {
		for(const instance of this[parent]) {
			instance.stop();
			instance.off('available', this[available]);
			instance.off('unavailable', this[unavailable]);
		}

		super.stop();
	}

	[available](service) {
		this[addService](service);
	}

	[unavailable](service) {
		// Check that this service is no longer available from any instance
		for(const instance of this[parent]) {
			if(instance[services].has(service.id)) return;
		}

		this[removeService](service);
	}
}
