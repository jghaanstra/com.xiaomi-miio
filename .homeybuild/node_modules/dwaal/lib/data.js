'use strict';

const fs = require('fs');
const msgpack = require('msgpack-lite');
const isDeepEqual = require('deep-equal');
const fsWriteStreamAtomic = require('fs-write-stream-atomic')

const TYPE_VERSION = 0;
const TYPE_ENTRY = 1;

/**
 * Class for holding data and persisting it to disk.
 */
module.exports = class Data {
	constructor(root) {
		this.file = root;
		this.data = new Map();
	}

	load() {
		if(this.loadPromise) return this.loadPromise;

		return this.loadPromise = new Promise((resolve, reject) => {
			if(! fs.existsSync(this.file)) {
				this.loadPromise = null;
				resolve();
				return;
			}

			// Read the metadata to figure out
			const stream = fs.createReadStream(this.file);
			const decoder = msgpack.createDecodeStream();

			stream.pipe(decoder)
				.on('data', d => {
					const type = d[0];
					if(type === TYPE_VERSION) {
						this.version = d[1];
						if(this.version != 1) {
							reject(new Error('Unsupported version of storage'));
						}
					} else if(type === TYPE_ENTRY) {
						this.data.set(d[1], d[2]);
					}
				})
				.on('end', () => resolve())
				.on('error', err => {
					this.loadPromise = null;
					reject(err);
				});
		});
	}

	store() {
		return new Promise((resolve, reject) => {
			const stream = fsWriteStreamAtomic(this.file);
			stream.on('error', err => reject(err));
			stream.on('end', resolve);

			const encoder = msgpack.createEncodeStream();
			encoder.pipe(stream);

			// Write the version of the storage
			encoder.write([ TYPE_VERSION, 1 ]);

			// Write all of the entries
			for(const [ key, value ] of this.data.entries()) {
				encoder.write([ TYPE_ENTRY, key, value ]);
			}

			encoder.end();
		});
	}

	close() {
		return this.store();
	}

	get(key) {
		return this.data.get(key);
	}

	set(key, value) {
		const d = this.data.get(key);
		if(isDeepEqual(d, value)) return;

		// Set the data
		this.data.set(key, value);

		// Queue a store if none has been stored
		if(! this.storeTimeout) {
			this.storeTimeout = setTimeout(() => {
				this.store();
				this.storeTimeout = 0;
			}, 500);
		}
	}
};
