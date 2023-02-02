'use strict';

const Thing = require('../thing');
const State = require('./state');

/**
 * Capability for things that can be renamed.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static availableAPI(builder) {
		builder.action('setName')
			.description('Set the name of this appliance')
			.argument('string', 'The name of the appliance')
			.done();
	}

	static get capability() {
		return 'nameable';
	}

	constructor(...args) {
		super(...args);
	}

	setName(name) {
		try {
			return Promise.resolve(this.changeName(name))
				.then(() => this.metadata.name);
		} catch(ex) {
			return Promise.reject(ex);
		}
	}

	changeName(name) {
		throw new Error('changeName has not been implemented');
	}
});
