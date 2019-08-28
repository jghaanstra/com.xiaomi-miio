'use strict';

const ZhiMiFan = require('./zhimi-fan');

module.exports = class extends ZhiMiFan {
	static get type() {
		return 'miio:zhimi-fan';
	}

	constructor(options) {
		super(options);

	}
};
