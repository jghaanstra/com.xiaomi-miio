'use strict';

const Thing = require('../thing');
const Controller = require('./controller');

module.exports = Thing.type(Parent => class extends Parent.with(Controller) {

	static get type() {
		return 'button';
	}

});
