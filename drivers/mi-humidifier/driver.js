"use strict";

var utils = require('/lib/utils.js');
var humidifiers = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Mi Humidifier initialized ...');
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
        delete humidifiers[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                humidifiers[device_data.id].data[key] = newSettingsObj[key];
                humidifiers[device_data.id].settings[key] = newSettingsObj[key];
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
    	}
    }
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    Homey.manager('drivers').getDriver('mi-humidifier').getName(device_data, function (err, name) {
        module.exports.getSettings(device_data, function( err, settings ) {
            humidifiers[device_data.id] = {
                name: name,
                data: {
                    id: device_data.id,
                    address: settings.address,
                    token: settings.token
                }
            }
            humidifiers[device_data.id].settings = settings;
        })
    })

    //TODO : resolve all humidifiers under their own device id during initialization instead for every seperate command
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.poweredHumidifier', function( callback, args ) {
    utils.sendCommand('powered', 0, humidifiers[args.device.id].settings.address, humidifiers[args.device.id].settings.token, callback);
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.modeHumidifier', function( callback, args ) {
    utils.sendCommand('mode', args.mode, humidifiers[args.device.id].settings.address, humidifiers[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.humidifierOn', function( callback, args ) {
    utils.sendCommand('turnon', 0, humidifiers[args.device.id].settings.address, humidifiers[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.humidifierOff', function( callback, args ) {
    utils.sendCommand('turnoff', 0, humidifiers[args.device.id].settings.address, humidifiers[args.device.id].settings.token, callback);
});
