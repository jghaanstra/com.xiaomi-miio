'use strict';

/*
 * Event functions used internally. These are very similiar to all other
 * EventEmitter implementations that exist for Node, but supports setting
 * the context when emitting events.
 */
const registeredListeners = Symbol('listeners');
const anyListeners = Symbol('anyListeners');
const context = Symbol('context');
const triggerListenerChange = Symbol('triggerListenerChange');

const listenersChanged = module.exports.listenersChanged =  Symbol('listenersChanged');

module.exports.EventEmitter = class EventEmitter {
	constructor(options) {
		this[registeredListeners] = {};
		this[anyListeners] = [];

		this[context] = options && options.context || this;
	}

	[triggerListenerChange]() {
		if(! this[listenersChanged]) return;

		const hasListeners = Object.keys(this[registeredListeners]).length > 0
			|| this[anyListeners].length > 0;
		this[listenersChanged](hasListeners);
	}

	get hasListeners() {
		return Object.keys(this[registeredListeners]).length > 0 || this[anyListeners] > 0;
	}

	/**
	* Listen for a specific event.
	*
	* @param eventName The event to listen for
	* @param listener The function that will be triggered
	*/
	on(eventName, listener) {
		const allListeners = this[registeredListeners];
		const listeners = allListeners[eventName] || (allListeners[eventName] = []);
		listeners.push(listener);

		this[triggerListenerChange]();

		return {
			stop: () => {
				this.off(eventName, listener);
			}
		};
	}

	/**
	* Stop listening for an event.
	*
	* @param eventName The event to no longer listen to
	* @param listener The function that should be removed
	*/
	off(eventName, listener) {
		if(! listener) return;

		const listeners = this[registeredListeners][eventName];
		if(! listeners) return;

		var idx = listeners.indexOf(listener);
		if(idx < 0) return;

		listeners.splice(idx, 1);

		this[triggerListenerChange]();
	}

	/**
	* Listen for a any event.
	*
	* @param eventName The event to listen for
	* @param listener The function that will be triggered
	*/
	onAny(listener) {
		this[anyListeners].push(listener);

		this[triggerListenerChange]();

		return {
			stop: () => this.offAny(listener)
		};
	}

	/**
	* Stop listening for an event.
	*
	* @param eventName The event to no longer listen to
	* @param listener The function that should be removed
	*/
	offAny(listener) {
		var idx = this[anyListeners].indexOf(listener);
		if(idx < 0) return;

		this[anyListeners].splice(idx, 1);

		this[triggerListenerChange]();
	}

	/**
	* Listen for an event but only trigger the listener if a certain
	* limit returns true.
	*/
	when(eventName, limit, listener) {
		const limitedListener = function(data) {
			if(limit(data)) {
				listener.call(this, data);
			}
		};
		this.on(eventName, limitedListener);

		return {
			stop: () => {
				this.off(eventName, limitedListener);
			}
		};
	}

	/**
	* Trigger a listener only once.
	*/
	once(eventName, listener) {
		const removingListener = function() {
			this.off(eventName, removingListener);

			listener.apply(this, arguments);
		};

		this.on(eventName, removingListener);
		return {
			stop: () => {
				this.off(eventName, removingListener);
			}
		};
	}

	/**
	* Emit an event. The first argument is the event name and all following
	* arguments are sent to any listener registered.
	*/
	emit(event) {
		const ctx = this[context];
		const allArgs = arguments;
		const args = Array.prototype.slice.call(arguments).slice(1);

		const listeners = this[registeredListeners][event];
		if(listeners) {
			for(const listener of listeners) {
				listener.apply(ctx, args);
			}
		}

		for(const listener of this[anyListeners]) {
			listener.apply(ctx, allArgs);
		}
	}

	/**
	* Emit an event with a specific context. The first argument is the context,
	* the second is the event name and all following arguments are sent to the
	* registered listeners.
	*/
	emitWithContext(ctx, event) {
		const allArgs = Array.prototype.slice.call(arguments, 1);
		const args = Array.prototype.slice.call(arguments, 2);

		const listeners = this[registeredListeners][event];
		if(listeners) {
			for(const listener of listeners) {
				listener.apply(ctx, args);
			}
		}

		for(const listener of this[anyListeners]) {
			listener.apply(ctx, allArgs);
		}
	}
};
