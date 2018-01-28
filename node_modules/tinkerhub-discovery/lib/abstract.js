'use strict';

const EventEmitter = require('eventemitter3');

const debugCreator = require('debug');
const { events, debug } = require('./symbols');


/**
 * Abstract discovery implementation. Provides a getter for fetching services
 * and hidden methods for manipulating the active services. Events are emitted
 * when service availability changes, `available` when a service becomes
 * available and `unavailable` when it becomes unavailable.
 */
module.exports = class AbstractDiscovery {
	constructor() {
		this[events] = new EventEmitter();
		this[debug] = debugCreator('th:discovery:' + (this.constructor.type || '???'));
	}

	/**
	 * Start listening for the given event.
	 *
	 * @param {string} event
	 * @param {function} listener
	 */
	on(event, listener) {
		this[events].on(event, listener);
		return this;
	}

	/**
	 * Stop listening for the given event.
	 *
	 * @param {string} event
	 * @param {function} listener
	 */
	off(event, listener) {
		this[events].off(event, listener);
		return this;
	}

	/**
	 * Start the discovery.
	 */
	start() {
	}

	/**
	 * Stop the discovery.
	 */
	stop() {
	}

	/**
	 * Filter the services made available by this discovery.
	 *
	 * @param {function} filter
	 */
	filter(filter) {
		// Require when actually used instead of upfront to avoid dependency cycle
		const FilteredDiscovery = require('./filtered');
		return new FilteredDiscovery(this, filter);
	}

	/**
	 * Map services made available by this discovery.
	 *
	 * @param {function} mapper
	 */
	map(mapper) {
		// Require when actually used instead of upfront to avoid dependency cycle
		const MappedDiscovery = require('./mapped');
		return new MappedDiscovery(this, mapper);
	}

	/**
	 * Combine this discovery instance with another one.
	 *
	 * @param {AbstractDiscovery} other
	 */
	and(other) {
		// Require when actually used instead of upfront to avoid dependency cycle
		const CombinedDiscovery = require('./combined');
		return new CombinedDiscovery([ this, other ]);
	}
};
