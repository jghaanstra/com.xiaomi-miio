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
                humidifiers[device_data.id].data[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    humidifiers[device_data.id] = {
        name: 'Mi Humidifier',
        data: {
            id: device_data.id,
            address: device_data.address,
            token: device_data.token
        }
    }

    //TODO : resolve all humidifiers under their own device id during initialization instead for every seperate command
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.poweredHumidifier', function( callback, args ) {
    utils.sendCommand('powered', humidifiers[args.device.id].data.address, humidifiers[args.device.id].data.token, callback);
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.modeHumidifier', function( callback, args ) {
    utils.sendCommand('mode', humidifiers[args.device.id].data.address, humidifiers[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.humidifierOn', function( callback, args ) {
    utils.sendCommand('turnon', humidifiers[args.device.id].data.address, humidifiers[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.humidifierOff', function( callback, args ) {
    utils.sendCommand('turnoff', humidifiers[args.device.id].data.address, humidifiers[args.device.id].data.token, callback);
});
