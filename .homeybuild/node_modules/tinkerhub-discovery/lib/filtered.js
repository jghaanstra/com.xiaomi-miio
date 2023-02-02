'use strict';

const util = require('util');

const AbstractDiscovery = require('./abstract');

const { events, debug } = require('./symbols');
const parent = Symbol('parent');
const filter = Symbol('filter');
const available = Symbol('available');
const unavailable = Symbol('unavailable');

/**
 * Provides filtering of any discovery instance.
 */
module.exports = class FilteredDiscovery extends AbstractDiscovery {
	static get type() {
		return 'filtered';
	}

	constructor(parent_, filter_) {
		super();

		this[parent] = parent_;
		this[filter] = filter_;

		this[available] = this[available].bind(this);
		this[unavailable] = this[unavailable].bind(this);

		if(parent_.active) {
			// Make sure we start if we are being filtered on an already started discovery
			parent_.on('available', this[available]);
			parent_.on('unavailable', this[unavailable]);
		}
	}

	/**
	 * Get all of the available services.
	 */
	get services() {
		return this[parent].services
			.filter(this[filter]);
	}

	/**
	 * Get if this discovery is active.
	 */
	get active() {
		return this[parent].active;
	}

	/**
	 * Start the discovery.
	 */
	start() {
		// Protect against starting twice and registering twice
		if(this[parent].active) return;

		this[parent].on('available', this[available]);
		this[parent].on('unavailable', this[unavailable]);

		this[parent].start();
	}

	/**
	 * Stop the discovery.
	 */
	stop() {
		this[parent].stop();
		this[parent].off('available', this[available]);
		this[parent].off('unavailable', this[unavailable]);
	}

	[available](service) {
		if(this[filter](service)) {
			this[debug]('Service with id', service.id, 'now available via', this[parent]);
			this[events].emit('available', service, this);
		}
	}

	[unavailable](service) {
		if(this[filter](service)) {
			this[debug]('Service with id', service.id, 'no longer available via', this[parent]);
			this[events].emit('unavailable', service, this);
		}
	}

	[util.inspect.custom](depth, options) {
		if(depth < 0) {
			return options.stylize('FilteredDiscovery', 'special');
		}

		const newOptions = Object.assign({}, options, {
			depth: options.depth === null ? null : options.depth - 1
		});

		const p = util.inspect(this[parent], newOptions);
		return options.stylize('FilteredDiscovery', 'special') + '{' + p + '}';
	}
}
