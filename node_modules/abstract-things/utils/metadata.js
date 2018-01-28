'use strict';

const thing = Symbol('thing');
const name = Symbol('name');

/**
 * Metadata for a appliance that provides a builder-like API for
 * easily updating the metadata.
 */
module.exports = class Metadata {
	constructor(instance) {
		this[thing] = instance;

		this.types = new Set();
		this.capabilities = new Set();
	}

	get name() {
		return this[name];
	}

	set name(n) {
		if(this[name] !== n) {
			this[name] = n;
			this[thing].emitEvent('thing:metadata', this);
		}
	}

	addTypes(...types) {
		for(let type of types) {
			this.types.add(type);
		}
		this[thing].emitEvent('thing:metadata', this);
		return this;
	}

	addCapabilities(...caps) {
		for(let cap of caps) {
			this.capabilities.add(cap);
		}
		this[thing].emitEvent('thing:metadata', this);
		return this;
	}

	removeCapabilities(...caps) {
		for(let cap of caps) {
			this.capabilities.delete(cap);
		}
		this[thing].emitEvent('thing:metadata', this);
		return this;
	}

	/**
	 * Get if the appliance is of the given type.
	 *
	 * @param {string} type
	 */
	hasType(type) {
		return this.types.has(type);
	}

	/**
	 * Get if the appliance has the given capability.
	 *
	 * @param {string} cap
	 */
	hasCapability(cap) {
		return this.capabilities.has(cap);
	}

	/**
	 * Check if this metadata matches the given tags.
	 *
	 * @param {string} tags
	 */
	matches(...tags) {
		for(const tag of tags) {
			if(tag.indexOf('type:') === 0) {
				if(! this.hasType(tag.substring(5))) {
					return false;
				}
			} else if(tag.indexOf('cap:') === 0) {
				if(! this.hasCapability(tag.substring(4))) {
					return false;
				}
			} else {
				return false;
			}
		}

		return true;
	}
};
