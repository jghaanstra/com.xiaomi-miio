const { decorate, apply, has } = require('./decoration');

/**
 * Create a function that applies the given mixin. This is the base for
 * the mixins.
 */
function root(mixin) {
	return decorate(mixin, superclass => apply(superclass, mixin));
}
module.exports = root;

/**
 * Create a function that deduplicates so that the mixin is only applied once.
 */
function deduplication(mixin) {
	return decorate(mixin, superclass => {
		// Check if the mixin is present
		if(has(superclass.prototype, mixin)) {
			return superclass;
		}

		// Apply the mixin
		return mixin(superclass);
	});
}

function hasInstance(mixin) {
	if(Symbol.hasInstance && ! mixin.hasOwnProperty(Symbol.hasInstance)) {
		Object.defineProperty(mixin, Symbol.hasInstance, {
			value: function mixinHasInstance(other) {
				return has(other, mixin);
			}
		});
	}

	// As an alternative to instanceof bind a custom function
	mixin.isInstance = function(other) {
		return has(other, mixin);
	};
	return mixin;
}

/**
 * Decorate the given function so that it behaves nicely as a mixin.
 */
function mixin(func) {
	return deduplication(root(hasInstance(func)));
}

module.exports.Mixin = mixin;
