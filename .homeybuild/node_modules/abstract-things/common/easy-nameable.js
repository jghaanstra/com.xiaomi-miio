'use strict';

const Thing = require('../thing');
const Nameable = require('./nameable');
const Storage = require('../storage');

/**
 * Capability for things that store their own name in the storage.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(Nameable, Storage) {
	constructor(...args) {
		super(...args);
	}

	initCallback() {
		return super.initCallback()
			.then(() => this.storage.get('name'))
			.then(name => name && (this.metadata.name = name));
	}

	changeName(name) {
		return this.storage.set('name', name)
			.then(() => this.metadata.name = name);
	}
});
