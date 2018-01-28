'use strict';

const Thing = require('./thing');
const { BasicDiscovery, addService, removeService, debug } = require('tinkerhub-discovery');

const parent = Symbol('parent');
const mapper = Symbol('mapper');
const available = Symbol('available');
const unavailable = Symbol('unavailable');
const updated = Symbol('updated');

const mapAndAddService = Symbol('mapService');
const mappedId = Symbol('mappedId');

function toMapper(m) {
	if(typeof m === 'function') {
		return {
			create: m
		};
	} else if(typeof m === 'object') {
		if(! m.create) {
			throw new Error('create(service) is needed in mapper');
		}

		return m;
	} else {
		throw new Error('Function or object (with create-method) needed for discovery');
	}
}

module.exports = class ThingDiscovery extends BasicDiscovery {
	static get type() {
		return 'thing';
	}

	constructor(parent_, mapper_) {
		super();

		this[parent] = parent_;
		this[mapper] = toMapper(mapper_);

		this[available] = this[available].bind(this);
		this[unavailable] = this[unavailable].bind(this);
		this[updated] = this[updated].bind(this);

		if(parent_.active) {
			// Make sure we start if we are being filtered on an already started discovery
			parent_.on('available', this[available]);
			parent_.on('unavailable', this[unavailable]);
			parent_.on('updated', this[updated]);

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
		this[parent].on('updated', this[updated]);

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
		this[parent].off('updated', this[updated]);

		super.stop();
	}

	[mapAndAddService](service) {
		Promise.resolve(this[mapper].create(service))
			.then(mapped => mapped && mapped.init())
			.then(mapped => {
				if(mapped) {
					if(mapped instanceof Thing) {
						// Bind up a listener for removal if the thing is destroyed
						const id = mapped.id;
						mapped.on('thing:destroy', () => this[removeService](id));

						// Cache the id this service mapped to
						service[mappedId] = mapped.id;

						// Add the mapped service
						this[addService](mapped);
					} else {
						this[debug]('Did not map into a thing:', mapped);
					}
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

	[updated](service) {
		// TODO: Fetch the mapped service and call mapper.update()
	}
};
