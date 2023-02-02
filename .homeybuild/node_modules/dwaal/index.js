'use strict';

const Network = require('./lib/network');
const Data = require('./lib/data');

const debug = require('debug')('dwaal');
const path = require('path');

module.exports = class Storage {
	constructor(options) {
		if(! options) throw new Error('Options need to be specified');
		if(typeof options.path !== 'string') throw new Error('`path` to directory used for storage is required');

		this.id = options.id;
		this.isOpen = false;
		this.openPromise = null;

		this.path = options.path;

		this.seq = 0;
		this.requests = new Map();
	}

	open() {
		// If this storage is openeded, return an already resolved promise
		if(this.isOpen) return Promise.resolve();

		// If this storage is being opened return the active promise
		if(this.openPromise) return this.openPromise;

		debug('Opening storage connection to', this.path);
		// Start the network using a socket under the storage path
		this.network = new Network(path.join(this.path, '.dwaal-socket'));
		this.network.on('message', this._handleMessage.bind(this));

		return this.openPromise = this.network.open()
			.then(() => {
				debug('Storage connection has been opened to', this.path);
				this.isOpen = true;
				this.openPromise = null;
			});
	}

	close() {
		this.network.close();
		this.isOpen = false;
		if(this.data) {
			return this.data.close();
		} else {
			return Promise.resolve();
		}
	}

	_rpc(action, args) {
		return this.open().then(() =>
			new Promise((resolve, reject) => {
				const seq = this.seq++;
				this.network.sendToLeader(seq, action, args );
				this.requests.set(seq, { resolve, reject });

				setTimeout(() => {
					reject();
					this.requests.delete(seq);
				}, 1500);
			})
		);
	}

	_data() {
		if(this.data) return this.data.load();

		this.data = new Data(path.join(this.path, 'storage.dwaal.bin'));
		return this.data.load();
	}

	_replyError(socket, seq, err) {
		socket.send([ seq, 'error', err.message ]);
	}

	_replySuccess(socket, seq, success) {
		socket.send([ seq, 'success', success ]);
	}

	get(key) {
		return this._rpc('get', [ key ]);
	}

	set(key, value) {
		return this._rpc('set', [ key, value ]);
	}

	_handleMessage({ returnPath, seq, type, payload }) {
		if(type === 'success') {
			/*
			 * Operation was successful. Resolve the promise associated with
			 * sequence.
			 */
			const promise = this.requests.get(seq);
			if(! promise) return;

			this.requests.delete(seq);
			promise.resolve(payload);
		} if(type === 'error') {
			/**
			 * Operation resulted in an error. Reject the promise associated
			 * with sequence.
			 */
			const promise = this.requests.get(seq);
			if(! promise) return;

			this.requests.delete(seq);
			promise.reject(new Error(payload));
		} else if(type === 'get') {
			/**
			 * Requesting that some data should be loaded.
			 */
			this._data().then(() => {
				const value = this.data.get(payload[0]);
				this._replySuccess(returnPath, seq, value);
			}).catch(err => {
				this._replyError(returnPath, seq, err);
			});
		} else if(type === 'set') {
			/**
			 * Requesting that some data should be set.
			 */
			this._data().then(() => {
				this.data.set(payload[0], payload[1]);
				this._replySuccess(returnPath, seq);
			}).catch(err => {
				this._replyError(returnPath, seq, err);
			});
		}
	}

	_handleReply({ type, payload }) {

	}
};
