"use strict";

var utils = require('/lib/utils.js');
var humidifiers = {};
var intervalId = {};

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

        socket.on('test-connection', function(data, callback) {
            utils.getHumidifier(data.address, data.token, function(error, result) {
                if (error) {
                    callback(error, null);
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
        delete humidifiers[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                humidifiers[device_data.id].data[key] = newSettingsObj[key];
                humidifiers[device_data.id].settings[key] = newSettingsObj[key];
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
                    id: device_data.id
                }
            }

            if (settings.polling == undefined) {
                settings.polling = 60;
            };
            
            humidifiers[device_data.id].settings = settings;

            utils.getHumidifier(settings.address, settings.token, function(error, result) {
                var state = {
                    onoff: result.onoff || false,
                    mode: result.mode || 'medium',
                    temperature: result.temperature || 0,
                    humidity: result.humidity || 0
                }
                humidifiers[device_data.id].state = state;
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
                if (humidifiers[device_data.id].state.onoff != result.onoff) {
                    humidifiers[device_data.id].state.onoff = result.onoff;
                    module.exports.realtime(device_data, "onoff", result.onoff);
                }
                if (humidifiers[device_data.id].state.mode != result.mode) {
                    humidifiers[device_data.id].state.mode = result.mode;
                }
                if (humidifiers[device_data.id].state.temperature != result.temperature) {
                    humidifiers[device_data.id].state.temperature = result.temperature;
                    module.exports.realtime(device_data, "measure_temperature", result.temperature);
                }
                if (humidifiers[device_data.id].state.humidity != result.humidity) {
                    humidifiers[device_data.id].state.humidity = result.humidity;
                    module.exports.realtime(device_data, "measure_humidity", result.humidity);
                }
            }
        });
    }, 1000 * interval);
}

function getDeviceByData(device_data) {
    var device = humidifiers[device_data.id];
    if (typeof device === 'undefined') {
        return new Error("invalid_device");
    } else {
        return device;
    }
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
