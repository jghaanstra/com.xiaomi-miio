'use strict';

const Thing = require('../thing');
const api = require('./api');
const storage = Symbol('storage');

module.exports = Thing.mixin(Parent => class extends Parent {
	static get storage() {
		return api.global();
	}

	get storage() {
		if(! this[storage]) {
			this[storage] = api.instance(this.id);
		}

		return this[storage];
	}
});
