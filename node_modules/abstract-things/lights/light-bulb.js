'use strict';

const Thing = require('../thing');
const Light = require('./light');

module.exports = Thing.type(Parent => class extends Parent.with(Light) {

	static get type() {
		return 'light-bulb';
	}

});
