'use strict';

const { EventEmitter } = require('events');

const debug = require('debug')('dwaal:network');
const leader = require('unix-socket-leader');
const MsgpackSock = require('msgpack-sock');
const eos = require('end-of-stream');

module.exports = class Network extends EventEmitter {
	constructor(path) {
		super();

		this.path = path;
	}

	open() {
		return new Promise((resolve, reject) => {
			let rejected = false;
			let connected = false;
			const connect = () => {
				this.leader = leader(this.path);

				this.leader.on('error', err => {
					debug('Trouble electing a storage leader;', err);

					try {
						this.leader.close();
					} catch(ex) {
						// Do nothing
					}

					if(! rejected) {
						debug('Retrying connection');
						connect();
					}
				});

				this.leader.on('connection', socket => {
					debug('Incoming connection from local process');
					const self = this;
					eos(socket, err => {
						if(err) {
							debug('Connection from client closed with error;', err);
						} else {
							debug('Connection from client closed cleanly');
						}
					});

					MsgpackSock.wrap(socket).on('message', function(msg) {
						self.emit('message', {
							returnPath: this,
							seq: msg[0],
							type: msg[1],
							payload: msg[2]
						});
					});
				});

				this.leader.on('client', socket => {
					debug('Connected to storage');
					connected = true;

					eos(socket, err => {
						if(err) {
							debug('Connection to leader closed with error;', err);
						} else {
							debug('Connection to leader closed cleanly');
						}
					});

					this.socket = MsgpackSock.wrap(socket);

					const self = this;
					this.socket.on('message', function(msg) {
						self.emit('message', {
							returnPath: this,
							seq: msg[0],
							type: msg[1],
							payload: msg[2]
						});
					});

					resolve();
				});
			};

			// Start first connection step
			connect();

			// Fallback, reject in a second
			setTimeout(() => {
				if(! connected) {
					rejected = true;
					reject();
				}
			}, 1000);
		});
	}

	sendToLeader(seq, action, args) {
		this.socket.send([ seq, action, args ]);
	}

	close() {
		this.leader.close();
	}
};
