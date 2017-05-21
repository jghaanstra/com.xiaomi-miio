"use strict";

var utils = require('/lib/utils.js');
var robots = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Mi Robot initialized ...');
    	callback (null, true);
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function( data, callback ) {
            utils.testConnection('find', data, function( err, result ) {
                if (err) {
                    Homey.log('Cannot send command: ' + err);
                    callback(err, null);
                } else {
                    callback(null, "Command send succesfully");
                }
            });
        });

        socket.on('add_device', function( device_data, callback ) {
            initDevice( device_data );
            callback( null, true );
        });
    },
    deleted: function (device_data, callback) {
        delete robots[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                robots[device_data.id].data[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    capabilities: {
        vacuumcleaner_state: {
            get: function (device_data, callback) {
                utils.sendCommand('state', device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, false);
                    } else {
                        switch (result) {
                            case 'cleaning':
                            case 'returning':
                                callback(null, 'cleaning');
                                break;
                            case 'spot-cleaning':
                                callback(null, 'spot_cleaning');
                                break;
                            case 'charging':
                                callback(null, 'charging');
                                break;
                            case 'paused':
                                callback(null, 'stopped');
                                break;
                            default:
                                callback(null, 'stopped');
                        }
                    }
                });
            },
            set: function (device_data, command, callback) {
                switch (command) {
					case "cleaning":
                        utils.sendCommand('start', 0, device_data.address, device_data.token, function( err, result ) {
                            if (err) {
                                callback(err, false);
                            } else {
                                callback(null, true);
                            }
                        });
                        break;
                    case "spot_cleaning":
                        utils.sendCommand('spotclean', 0, device_data.address, device_data.token, function( err, result ) {
                            if (err) {
                                callback(err, false);
                            } else {
                                callback(null, true);
                            }
                        });
                        break;
                    case "stopped":
                        utils.sendCommand('stop', 0, device_data.address, device_data.token, function( err, result ) {
                            if (err) {
                                callback(err, false);
                            } else {
                                callback(null, true);
                            }
                        });
                        break;
                    case "docked":
                    case "charging":
                        utils.sendCommand('charge', 0, device_data.address, device_data.token, function( err, result ) {
                            if (err) {
                                callback(err, false);
                            } else {
                                callback(null, true);
                            }
                        });
                        break;
                    default:
                        Homey.log("Not a valid vacuumcleaner_state");
                }
            }
        },
        measure_battery: {
    		get: function (device_data, callback) {
                utils.sendCommand('battery', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, false);
                    } else {
                        callback(null, result);
                    }
                });
    		}
    	}
    }
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    robots[device_data.id] = {
        name: 'Mi Robot',
        data: {
            id: device_data.id,
            address: device_data.address,
            token: device_data.token
        }
    }

    //TODO : resolve all robots under their own device id during initialization instead for every seperate command
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.cleaningVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, function( err, result ) {
        if (result == 'cleaning') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.chargingVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, function( err, result ) {
        if (result == 'charging') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.returningVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, function( err, result ) {
        if (result == 'returning') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.pausedVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, function( err, result ) {
        if (result == 'paused') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.startVacuum', function( callback, args ) {
    utils.sendCommand('start', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.pauseVacuum', function( callback, args ) {
    utils.sendCommand('pause', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.stopVacuum', function( callback, args ) {
    utils.sendCommand('stop', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.chargeVacuum', function( callback, args ) {
    utils.sendCommand('charge', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.spotCleanVacuum', function( callback, args ) {
    utils.sendCommand('spotclean', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.findVacuum', function( callback, args ) {
    utils.sendCommand('find', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.fanPowerVacuum', function( callback, args ) {
    utils.sendCommand('fanPower', 0, robots[args.device.id].data.address, robots[args.device.id].data.token, callback);
});
