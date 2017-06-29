"use strict";

var utils = require('/lib/utils.js');
var airpurifiers = {};
var intervalId = {};

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

        socket.on('test-connection', function(data, callback) {
            utils.getAirPurifier(data.address, data.token, function(error, result) {
                if (error) {
                    callback(error, false);
                } else {
                    callback(null, result);
                }
            });
        });

        socket.on('add_device', function(device_data, callback) {
            initDevice(device_data);
            callback(null, true);
        });
    },
    deleted: function (device_data, callback) {
        clearInterval(intervalId[device_data.id]);
        delete airpurifiers[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                airpurifiers[device_data.id].data[key] = newSettingsObj[key];
                airpurifiers[device_data.id].settings[key] = newSettingsObj[key]
            })
            clearInterval(intervalId[device_data.id]);
            pollDevices(device_data);
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    capabilities: {
        onoff: {
    		get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
                if (device instanceof Error) return callback(device);

                return callback(null, device.state.onoff);
    		},
    		set: function (device_data, onoff, callback) {
                utils.sendCommand('toggle', 0, device_data.address, device_data.token, function(error, result) {
                    if (error) {
                        callback(null, false);
                    } else {
                        var device = getDeviceByData(device_data);
                        if (device instanceof Error) return callback(device);
                        device.state.onoff = onoff;
                        module.exports.realtime(device_data, 'onoff', device.state.onoff);
                        callback(null, device.state.onoff);
                    }
                });
    		}
    	},
        measure_temperature: {
    		get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
                if (device instanceof Error) return callback(device);

                return callback(null, device.state.temperature);
    		}
    	},
        measure_humidity: {
    		get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
                if (device instanceof Error) return callback(device);

                return callback(null, device.state.humidity);
    		}
    	},
        measure_aqi: {
    		get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
                if (device instanceof Error) return callback(device);

                return callback(null, device.state.aqi);
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
                    id: device_data.id
                }
            }
            
            if (settings.polling == undefined) {
                settings.polling = 60;
            };

            airpurifiers[device_data.id].settings = settings;

            utils.getAirPurifier(settings.address, settings.token, function(error, result) {
                var state = {
                    onoff: result.onoff || false,
                    mode: result.mode || 'medium',
                    temperature: result.temperature || 0,
                    humidity: result.humidity || 0,
                    aqi: result.aqi || 0
                }
                airpurifiers[device_data.id].state = state;
            })

            pollDevices(device_data);
        })
    })
}

function pollDevices(device_data) {
    var device = getDeviceByData(device_data);
    if (device instanceof Error) return callback(device);

    var interval = device.settings.polling || 60;

    intervalId[device_data.id] = setInterval(function () {
        utils.getAirPurifier(device.settings.address, device.settings.token, function(error, result) {
            if (result != null) {
                if (airpurifiers[device_data.id].state.onoff != result.onoff) {
                    airpurifiers[device_data.id].state.onoff = result.onoff;
                    module.exports.realtime(device_data, "onoff", result.onoff);
                }
                if (airpurifiers[device_data.id].state.mode != result.mode) {
                    airpurifiers[device_data.id].state.mode = result.mode;
                }
                if (airpurifiers[device_data.id].state.temperature != result.temperature) {
                    airpurifiers[device_data.id].state.temperature = result.temperature;
                    module.exports.realtime(device_data, "measure_temperature", result.temperature);
                }
                if (airpurifiers[device_data.id].state.humidity != result.humidity) {
                    airpurifiers[device_data.id].state.humidity = result.humidity;
                    module.exports.realtime(device_data, "measure_humidity", result.humidity);
                }
                if (airpurifiers[device_data.id].state.aqi != result.aqi) {
                    airpurifiers[device_data.id].state.aqi = result.aqi;
                    module.exports.realtime(device_data, "measure_aqi", result.aqi);
                }
            }
        });
    }, 1000 * interval);
}

function getDeviceByData(device_data) {
    var device = airpurifiers[device_data.id];
    if (typeof device === 'undefined') {
        return new Error("invalid_device");
    } else {
        return device;
    }
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.poweredAirpurifier', function( callback, args ) {
    utils.sendCommand('powered', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.modeAirpurifier', function( callback, args ) {
    utils.sendCommand('mode', args.mode, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.airpurifierOn', function( callback, args ) {
    utils.sendCommand('turnon', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});

Homey.manager('flow').on('action.airpurifierOff', function( callback, args ) {
    utils.sendCommand('turnoff', 0, airpurifiers[args.device.id].settings.address, airpurifiers[args.device.id].settings.token, callback);
});
