"use strict";

var utils = require('/lib/utils.js');
var airpurifiers = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Mi Air Purifier initialized ...');
    	callback (null, true);
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function( data, callback ) {
            utils.testConnection('buzzer', data, function( err, result ) {
                if (err) {
                    Homey.log('Cannot send command: ' + err);
                    callback(err, null);
                } else {
                    callback(null, "Command send succesfully");
                }
            });
        });

        socket.on('add_device', function( device_data, callback ){
            initDevice( device_data );
            callback( null, true );
        });
    },
    deleted: function (device_data, callback) {
        delete airpurifiers[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                airpurifiers[device_data.id].data[key] = newSettingsObj[key];
                airpurifiers[device_data.id].settings[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    capabilities: {
        onoff: {
    		get: function (device_data, callback) {
                utils.sendCommand('powered', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(true, false);
                    } else {
                        callback(null, true);
                    }
                });
    		},
    		set: function (device_data, onoff, callback) {
                utils.sendCommand('toggle', 0, device_data.address, device_data.token, callback );
                return callback(null, true);
    		}
    	},
        measure_temperature: {
    		get: function (device_data, callback) {
                utils.sendCommand('temperature', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
    		}
    	},
        measure_humidity: {
    		get: function (device_data, callback) {
                utils.sendCommand('humidity', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
    		}
    	},
        measure_aqi: {
    		get: function (device_data, callback) {
                utils.sendCommand('aqi', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
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
    Homey.manager('drivers').getDriver('mi-airpurifier').getName(device_data, function (err, name) {
        module.exports.getSettings(device_data, function( err, settings ) {
            airpurifiers[device_data.id] = {
                name: name,
                data: {
                    id: device_data.id,
                    address: settings.address,
                    token: settings.token
                }
            }
            airpurifiers[device_data.id].settings = settings;
        })
    })

    //TODO : resolve all air purifiers under their own device id during initialization instead for every seperate command
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.poweredAirpurifier', function( callback, args ) {
    utils.sendCommand('powered', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.modeAirpurifier', function( callback, args ) {
    utils.sendCommand('mode', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.airpurifierOn', function( callback, args ) {
    utils.sendCommand('turnon', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.airpurifierOff', function( callback, args ) {
    utils.sendCommand('turnoff', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});
