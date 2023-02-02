'use strict';

const Thing = require('../thing');

module.exports = Thing.type(Parent => class extends Parent {

	static get type() {
		return 'power-outlet';
	}

});
