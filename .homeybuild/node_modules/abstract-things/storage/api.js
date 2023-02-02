'use strict';

const path = require('path');
const mkdirp = require('mkdirp');

const AppDirectory = require('appdirectory');
const Storage = require('dwaal');

const values = require('../values');

let storage;
let parent;

function resolveDataDir() {
	if(! parent) {
		if(process.env.THING_STORAGE) {
			parent = process.env.THING_STORAGE;
		} else {
			const dirs = new AppDirectory('abstract-things');
			parent = dirs.userData();
		}

		mkdirp.sync(parent);
	}

	return parent;
}

function resolveStorage() {
	if(storage) return storage;

	let parent = resolveDataDir();
	const p = path.join(parent, 'storage');
	mkdirp.sync(p);

	storage = new Storage({
		path: p
	});
	return storage;
}

class SubStorage {
	constructor(storage, sub) {
		this._storage = storage;
		this._path = sub;
	}

	get(key) {
		return this._storage.get(this._path + '/' + key)
			.then(json => values.fromJSON('mixed', json));
	}

	set(key, value) {
		return this._storage.set(this._path + '/' + key, values.toJSON('mixed', value));
	}

	sub(key) {
		return new SubStorage(this._storage, this._path + '/' + key);
	}

	inspect() {
		return 'Storage[' + this._path + ']';
	}

	toString() {
		return this.inspect();
	}
}

module.exports = {
	get dataDir() {
		return resolveDataDir();
	},

	global() {
		return new SubStorage(resolveStorage(), 'global');
	},

	instance(id) {
		return new SubStorage(resolveStorage(), 'instance/' + id);
	}
};
