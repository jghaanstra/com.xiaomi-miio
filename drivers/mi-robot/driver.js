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

        socket.on('test-connection', function(data, callback) {
            utils.sendCommand('find', 0, data.address, data.token, function(error, result) {
                if (error) {
                    Homey.log('Cannot send command: ' + error);
                    callback(error, null);
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
                robots[device_data.id].data[key] = newSettingsObj[key];
                robots[device_data.id].settings[key] = newSettingsObj[key];
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
    Homey.manager('drivers').getDriver('mi-robot').getName(device_data, function (err, name) {
        module.exports.getSettings(device_data, function( err, settings ) {
            robots[device_data.id] = {
                name: name,
                data: {
                    id: device_data.id,
                    address: settings.address,
                    token: settings.token
                }
            }
            robots[device_data.id].settings = settings;
        })
    })

    //TODO : resolve all robots under their own device id during initialization instead for every seperate command
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.cleaningVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, function( err, result ) {
        if (result == 'cleaning') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.chargingVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, function( err, result ) {
        if (result == 'charging') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.returningVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, function( err, result ) {
        if (result == 'returning') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.pausedVacuum', function( callback, args ) {
    utils.sendCommand('state', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, function( err, result ) {
        if (result == 'paused') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.startVacuum', function( callback, args ) {
    utils.sendCommand('start', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.pauseVacuum', function( callback, args ) {
    utils.sendCommand('pause', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.stopVacuum', function( callback, args ) {
    utils.sendCommand('stop', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.chargeVacuum', function( callback, args ) {
    utils.sendCommand('charge', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.spotCleanVacuum', function( callback, args ) {
    utils.sendCommand('spotclean', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.findVacuum', function( callback, args ) {
    utils.sendCommand('find', 0, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.fanPowerVacuum', function( callback, args ) {
    utils.sendCommand('fanPower', args.fanspeed, robots[args.device.id].settings.address, robots[args.device.id].settings.token, callback);
});
