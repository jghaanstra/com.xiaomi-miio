const reference = Symbol('decorator:ref');
const application = Symbol('decorator:application');

/**
 * Helper used when wrapping a function that enhances a mixin. Used to ensure
 * that its possible to figure out the original mixin function.
 */
module.exports.decorate = function decorate(mixin, decorator) {
	Object.setPrototypeOf(decorator, mixin);
	if(! mixin[reference]) {
		mixin[reference] = mixin;
	}
	return decorator;
};

/**
 * Resolve the original mixin.
 */
function original(mixin) {
	return mixin[reference] || mixin;
}
module.exports.original = original;

/**
 * Apply the given mixin and store its application.
 */
module.exports.apply = function apply(superclass, mixin) {
	const result = mixin(superclass);
	result.prototype[application] = original(mixin);
	return result;
};

/**
 * Get if the given object has had the given mixin applied.
 */
module.exports.has = function has(object, mixin) {
	const originalMixin = original(mixin);
	while(object != null) {
		if(object.hasOwnProperty(application) && object[application] == originalMixin) {
			return true;
		}

		object = Object.getPrototypeOf(object);
	}

	return false;
};
