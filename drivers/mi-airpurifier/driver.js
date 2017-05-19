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
                airpurifiers[device_data.id].data[key] = newSettingsObj[key]
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
    airpurifiers[device_data.id] = {
        name: 'Mi Air Purifier',
        data: {
            id: device_data.id,
            address: device_data.address,
            token: device_data.token
        }
    }

    //TODO : resolve all air purifiers under their own device id during initialization instead for every seperate command
}

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.poweredAirpurifier', function( callback, args ) {
    utils.sendCommand('powered', airpurifiers[args.device.id].data.address, airpurifiers[args.device.id].data.token, callback);
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.modeAirpurifier', function( callback, args ) {
    utils.sendCommand('mode', airpurifiers[args.device.id].data.address, airpurifiers[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.airpurifierOn', function( callback, args ) {
    utils.sendCommand('turnon', airpurifiers[args.device.id].data.address, airpurifiers[args.device.id].data.token, callback);
});

Homey.manager('flow').on('action.airpurifierOff', function( callback, args ) {
    utils.sendCommand('turnoff', airpurifiers[args.device.id].data.address, airpurifiers[args.device.id].data.token, callback);
});
