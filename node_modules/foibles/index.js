const AsMixin = Symbol('asMixin');

// Require and expose the mixin factory
const { Mixin } = require('./mixins')
module.exports.Mixin = Mixin;

/**
 * Create a class that can also be used as a mixin.
 */
module.exports.Class = function(superclass, func) {
	const MixableType = performMixin(superclass, func);
	MixableType[AsMixin] = Mixin(func);
	return MixableType;
};

/**
 * Turn a class into something that is extendable with mixins.
 */
module.exports.toExtendable = function(type) {
    type.with = function(...mixins) {
        return mix(type, ...mixins);
	};
	return type;
};

function mix(base, ...mixins) {
	let root = base;
	let chain = root.name;
	for(let i=0; i<mixins.length; i++) {
		let mixin = mixins[i];

		if(! mixin) {
			throw new Error('Trying to apply non-existent mixin');
		}

		if(mixin[AsMixin]) {
			mixin = mixin[AsMixin];
		}

		if(! mixin) {
			throw new Error('Mixin implementation bug, resolved to non-existent mixin');
		}

		root = performMixin(root, mixin);
		chain = root.name + ' > ' + chain;
	}

	return root;
}

function performMixin(root, mixin) {
	const type = mixin(root);
	// Bind a new function for with for this class
	type.with = function(...mixins) {
		return mix(type, ...mixins);
	};
	return type;
}

module.exports.mix = mix;
