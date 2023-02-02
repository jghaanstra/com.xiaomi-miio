'use strict';

const ExpiringDiscovery = require('./expiring');
const { search, debug } = require('./symbols');
const searchTime = Symbol('searchTime');
const timer = Symbol('timer');

function resolveOptions(options) {
	const result = Object.assign({}, options);

	// If a maxStaleTime is set but no search time, infer search interval
	if(result.maxStaleTime && ! result.searchTime) {
		result.searchTime = result.maxStaleTime / 3;
	}

	// If a searchTime is set but no maxStaleTime infer the the maxStaleTime
	if(! result.maxStaleTime && result.searchTime) {
		result.maxStaleTime = result.searchTime * 3;
	}

	if(! result.searchTime) {
		throw new Error('Either maxStaleTime or searchTime needs to be specified');
	}

	return result;
}

module.exports = class TimedDiscovery extends ExpiringDiscovery {
	constructor(options) {
		if(! options) throw new Error('options are required');
		options = resolveOptions(options);

		super(options);

		this[debug]('Searching every', options.searchTime, 'ms');
		this[searchTime] = options.searchTime;
	}

	[search]() {
		throw new Error('Search has not been implemented');
	}

	start() {
		super.start();

		const s = () => {
			this[debug]('Searching for services');
			try {
				this[search]();
			} catch(ex) {
				this[debug]('Could not complete search', ex);
			}
		};

		// Bind the interval at which search is executed
		this[timer] = setInterval(s, this[searchTime]);

		// And then start a search
		setImmediate(s);
	}

	stop() {
		clearInterval(this[timer]);

		super.stop();
	}
}
