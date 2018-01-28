'use strict';

const { Class, Mixin, toExtendable, mix } = require('foibles');
const { EventEmitter } = require('./events');
const debug = require('debug');

const collectMetadata = require('./utils/collectMetadata');
const merge = require('./utils/merge');

const id = Symbol('id');
const debugProperty = Symbol('debug');

const eventQueue = Symbol('eventQueue');
const eventEmitter = Symbol('eventEmitter');

const isInitialized = Symbol('isInitialized');
const isDestroyed = Symbol('isDestroyed');

module.exports = toExtendable(class Thing {
	constructor() {
		this.metadata = collectMetadata(Thing, this);

		this[eventQueue] = [];
		this[eventEmitter] = new EventEmitter({
			context: this
		});
	}

	get id() {
		return this[id] || null;
	}

	set id(identifier) {
		// Make sure the identifier is not changed after device init
		if(this[isInitialized]) {
			throw new Error('Identifier can not be changed after initialization has been done');
		}

		// Do a simple check to ensure the identifier is a string
		if(typeof identifier !== 'string') {
			throw new Error('Identifier should be a string');
		}

		/*
		 * Set the identifier without further validation. This allows it to be
		 * set to something invalid and then enhanced via initCallbacks
		 */
		this[id] = identifier;
	}

	init() {
		if(this[isInitialized]) return Promise.resolve(this);

		this[isDestroyed] = false;

		return Promise.resolve(this.initCallback())
			.then(() => {
				/*
				 * Validate the identifier after initialization to ensure that
				 * it is correctly set.
				 */
				if(typeof this.id !== 'string') {
					throw new Error('Identifier needs to be set either during thing construction or during init');
				}

				if(this.id.indexOf(':') <= 0) {
					throw new Error('Identifier does not contain a namespace, currently: `' + this.id + '`');
				}

				this[isInitialized] = true;

				this.emitEvent('thing:initialized');
				return this;
			});
	}

	initCallback() {
		return Promise.resolve();
	}

	/**
	 * Destroy this appliance, freeing any resources that it is using.
	 */
	destroy() {
		if(! this[isInitialized] || this[isDestroyed]) return Promise.resolve();

		this[isDestroyed] = true;
		this[isInitialized] = false;
		return Promise.resolve(this.destroyCallback())
			.then(() => {
				this.emitEvent('thing:destroyed');
			});
	}

	destroyCallback() {
		return Promise.resolve();
	}

	/**
	 * Emit an event with the given name and data.
	 *
	 * @param {string} event
	 * @param {*} data
	 */
	emitEvent(event, data, options) {
		const queue = this[eventQueue];

		// Metadata may emit events before the queue is availabe, skip them
		if(! queue) return;

		const shouldQueueEmit = queue.length === 0;

		const multiple = options ? options.multiple : false;
		if(! multiple) {
			// Check if there is already an even scheduled
			const idx = queue.findIndex(e => e[0] === event);
			if(idx >= 0) {
				// Remove the event - only a single event can is emitted per tick
				queue.splice(idx, 1);
			}
		} else if(typeof multiple === 'function') {
			// More advanced matching using a function
			for(let i=0; i<queue.length; i++) {
				const e = queue[i];
				if(e[0] === event && multiple(e[1])) {
					// This event matches, remove it
					queue.splice(i, 1);
					break;
				}
			}
		}

		// Add the event to the queue
		queue.push([ event, data ]);

		if(shouldQueueEmit) {
			// Schedule emittal of the events
			setImmediate(() => {
				const emitter = this[eventEmitter];
				for(const e of queue) {
					emitter.emit(e[0], e[1], this);
				}

				this[eventQueue] = [];
			});
		}
	}

	on(event, listener) {
		return this[eventEmitter].on(event, listener);
	}

	off(event, listener) {
		return this[eventEmitter].off(event, listener);
	}

	onAny(listener) {
		return this[eventEmitter].onAny(listener);
	}

	offAny(listener) {
		return this[eventEmitter].offAny(listener);
	}

	debug() {
		if(! this[debugProperty]) {
			this[debugProperty] = debug('thing:' + this.id);
		}

		this[debugProperty].apply(this[debugProperty], arguments);
	}

	/**
	 * Check if this appliance matches all of the given tags.
	 */
	matches(...tags) {
		return this.metadata.matches(...tags);
	}

	/**
	 * Create a new type that can be mixed in with Appliance.
	 *
	 * @param {function} func
	 */
	static type(func) {
		return Class(Thing, func);
	}

	/**
	 * Create a new capability that can be mixed in with a Appliance.
	 *
	 * @param {function} func
	 */
	static mixin(func) {
		return Mixin(func);
	}

	/**
	 * Mixin the given mixins to the specified object.
	 *
	 * @param {*} obj
	 * @param {array} mixins
	 */
	static mixinDynamic(obj, ...mixins) {
		const direct = Object.getPrototypeOf(obj);
		const parent = Object.getPrototypeOf(direct);

		const proto = {};
		for(let name of Object.getOwnPropertyNames(direct)) {
			proto[name] = direct[name];
		}
		const base = mix(parent.constructor, ...mixins);
		Object.setPrototypeOf(proto, base.prototype);

		Object.setPrototypeOf(obj, proto);

		const data = new base();
		merge(obj, data);
	}

	/**
	 * Extend this appliance with the given mixin. Used to dynamically apply
	 * capabilities during instance construction.
	 *
	 * @param {array} mixins
	 */
	extendWith(...mixins) {
		Thing.mixinDynamic(this, ...mixins);
	}
});
