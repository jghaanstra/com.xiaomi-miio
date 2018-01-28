'use strict';

const BasicDiscovery = require('./basic');

const { addService, removeService, parent, debug } = require('./symbols');
const mapper = Symbol('mapper');
const available = Symbol('available');
const unavailable = Symbol('unavailable');

const mapAndAddService = Symbol('mapService');
const mappedId = Symbol('mappedId');

/**
 * Provides mapping of any discovery instance.
 */
module.exports = class MappedDiscovery extends BasicDiscovery {
	static get type() {
		return 'mapped';
	}

	constructor(parent_, mapper_) {
		super();

		this[parent] = parent_;
		this[mapper] = mapper_;

		this[available] = this[available].bind(this);
		this[unavailable] = this[unavailable].bind(this);

		if(parent_.active) {
			// Make sure we start if we are being filtered on an already started discovery
			parent_.on('available', this[available]);
			parent_.on('unavailable', this[unavailable]);

			for(const service of parent_.services) {
				this[mapAndAddService](service);
			}

			this.active = true;
		}
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

		super.start();
	}

	/**
	 * Stop the discovery.
	 */
	stop() {
		this[parent].stop();
		this[parent].off('available', this[available]);
		this[parent].off('unavailable', this[unavailable]);

		super.stop();
	}

	[mapAndAddService](service) {
		Promise.resolve(this[mapper](service))
			.then(mapped => {
				if(mapped && mapped.id) {
					// Cache the id this service mapped to
					service[mappedId] = mapped.id;

					// Add the mapped service
					this[addService](mapped);
				}
			})
			.catch(error => this[debug]('Could not map service', error));
	}

	[available](service) {
		this[mapAndAddService](service);
	}

	[unavailable](service) {
		// Get the id that this service mapped to
		const id = service[mappedId];

		// Make sure that this service has been mapped to something
		if(! id) return;

		this[removeService](id);
	}
};
