'use strict';

const defId = Symbol('defId');

module.exports = class ChildSyncer {

	constructor(parent, syncFunction) {
		this.parent = parent;
		this.syncFunction = syncFunction;

		this.children = new Map();

		this.destroyListener = (_, thing) => {
			// Remove this event listener
			thing.off('thing:destroyed', this.destroyListener);

			// Remove reference to thing
			this.children.delete(thing[defId]);
			this.parent.removeChild(thing);
		};

		/*
		 * Add a listener to the parent so that children are destroyed when
		 * parent is destroyed.
		 */
		this.parent.on('thing:destroyed', () => {
			for(const child of this.children.values()) {
				child.destroy();
			}
		});
	}

	update(definitions) {
		if(! definitions || ! definitions[Symbol.iterator]) throw new Error('Definitions that are iterable are needed to synchronize');

		const promises = [];

		const children = this.children;
		const allIds = new Set();
		for(const def of definitions) {
			if(! def.id) {
				throw new Error('`id` is needed on definitions');
			}

			allIds.add(def.id);

			if(! children.has(def.id)) {
				// This child does not exist, create and register it
				const child = this.syncFunction(def, null);
				if(child) {
					// Keep the definition id for use in destroy listener
					child[defId] = def.id;

					// Initialize the child if needed
					const promise = child.init()
						.then(() => {
							// Keep track of the mapping
							children.set(def.id, child);

							// Start listening for destruction
							child.on('thing:destroyed', this.destroyListener);

							// Add the child
							this.parent.addChild(child);
						});

					promises.push(promise);
				}
			} else {
				const child = this.syncFunction(def, children.get(def.id));
				if(! child) {
					// Synchronization did not return a thing, destroy it
					const current = children.get(def.id);
					promises.push(current.destroy());
				}
			}
		}

		// Remove all the ids that are no longer present
		for(const id of children.keys()) {
			if(! allIds.has(id)) {
				// Thing is no longer present, destroy it
				const current = children.get(id);
				promises.push(current.destroy());
			}
		}

		return Promise.all(promises);
	}
};
