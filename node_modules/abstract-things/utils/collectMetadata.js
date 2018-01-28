'use strict';

const DefinitionBuilder = require('./define-api');
const Metadata = require('./metadata');

function collect(metadata, tags, prefix, func, prototype, getter) {
	// Check that the getter we are using belongs to the prototype
	if(! prototype.hasOwnProperty(getter)) return;

	// Get the value returned
	const r = prototype[getter];

	// The value needs to be something useful
	if(typeof r === 'undefined' || r === null) return;

	if(typeof r === 'string') {
		// Strings are not expanded when passed to metadata
		metadata[func](r);
		tags.push(prefix + ':' + r);
	} else if(Array.isArray(r)) {
		// Arrays are expanded
		metadata[func](...r);
		for(const i of r) {
			tags.push(prefix + ':' + i);
		}
	}
}

/**
 * Go through the prototype chain of a class looking for information that
 * is used to create metadata about an instance.
 */
module.exports = function collectMetadata(Parent, instance) {
	const metadata = new Metadata(instance);
	const builder = new DefinitionBuilder();

	let prototype = instance.constructor;
	while(prototype !== Parent) {
		const tags = [];

		// static get types() { return [ 'typeA', 'typeB ] }
		collect(metadata, tags, 'type', 'addTypes', prototype, 'types');

		// static get type() { return 'type' }
		collect(metadata, tags, 'type', 'addTypes', prototype, 'type');

		// static get capabilities() { return [ 'capA', 'capB ] }
		collect(metadata, tags, 'cap', 'addCapabilities', prototype, 'capabilities');

		// static get capability() { return 'cap' }
		collect(metadata, tags, 'cap', 'addCapabilities', prototype, 'capability');

		// Set the tags to mark the actions with
		builder.markWith(tags);

		const api = prototype.availableAPI;
		if(typeof api === 'function') {
			prototype.availableAPI(builder);
		} else if(Array.isArray(api)) {
			// If an array treat each entry as a name
			for(const action of api) {
				builder.action(action).done();
			}
		}

		prototype = Object.getPrototypeOf(prototype);
	}

	Object.assign(metadata, builder.done());
	return metadata;
};
