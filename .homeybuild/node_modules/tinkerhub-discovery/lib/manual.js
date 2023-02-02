'use strict';

const { addService, removeService } = require('./symbols');
const BasicDiscovery = require('./basic');

/**
 * Discovery implementation for manually adding or removing available services.
 */
module.exports = class ManualDiscovery extends BasicDiscovery {

	constructor() {
		super();

		// Manual discovery is always started
		this.start();
	}

	stop() {
		// Stop does nothing
	}

	/**
	 * Add a service that should be available.
	 *
	 * @param {object} service
	 */
	add(service) {
		return this[addService](service);
	}

	/**
	 * Remove a service so that it is no longer available.
	 *
	 * @param {object} service
	 */
	remove(service) {
		return this[removeService](service);
	}
};
