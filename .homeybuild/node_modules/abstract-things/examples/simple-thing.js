'use strict';

const { Thing } = require('../');

class SimpleThing extends Thing {
	// Define the type of the thing
	static get type() {
		return 'simple-thing';
	}

	// Quick way to define actions available for this thing
	static get availableAPI() {
		return [ 'hello' ];
	}

	constructor() {
		super();

		// An identifier of the thing should always be set - with a namespace
		this.id = 'thing:example-1';
	}

	hello() {
		return 'Cookies are tasty';
	}
}

console.log(new SimpleThing());
