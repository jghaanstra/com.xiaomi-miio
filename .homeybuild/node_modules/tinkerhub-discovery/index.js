'use strict';

const symbols = require('./lib/symbols');
module.exports.addService = symbols.addService;
module.exports.removeService = symbols.removeService;
module.exports.setServices = symbols.setServices;
module.exports.refService = symbols.refService;
module.exports.unrefService = symbols.unrefService;

/** Symbol used for searching for new services using TimedDiscovery */
module.exports.search = symbols.search;

/** Symbol used to output debug information for a discovery instance */
module.exports.debug = symbols.debug;

module.exports.AbstractDiscovery = require('./lib/abstract');
module.exports.BasicDiscovery = require('./lib/basic');
module.exports.ManualDiscovery = require('./lib/manual');
module.exports.ExpiringDiscovery = require('./lib/expiring');
module.exports.TimedDiscovery = require('./lib/timed');

const CombinedDiscovery = require('./lib/combined');
module.exports.combine = function(...instances) {
	return new CombinedDiscovery(instances);
};
