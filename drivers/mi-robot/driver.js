"use strict";

const mirobot = require('miio');
var robots = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});

        Homey.log ("Xiaomi Mi Robot - Init done");

    	callback (null, true);
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function( data, callback ) {
            miio.device({
            	address: data.address,
                token: data.token
            }).then(device => {
            	device.find();
                callback(null, "Command send succesfully");
            }).catch(function (err) {
                Homey.log('Cannot send command: ' + err);
                callback(err, null);
            });
        });

        socket.on('add_device', function( device_data, callback ){
            initDevice( device_data );
            callback( null, true );
        });
    },
    deleted: function (device_data, callback) {
        delete robots[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        Homey.log ('Mi Robot changed settings: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj));

        try {
            changedKeysArr.forEach(function (key) {
                robots[device_data.id].settings[key] = newSettingsObj[key]
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

    robots[device_data.id] = {};

    module.exports.getSettings(device_data, function (err, settings) {
        if( err ) return Homey.error(err);
        robots[device_data.id] = {
            name: 'Mi Robot',
            data: device_data,
            settings: settings
        }

        //TODO : resolve all vacuum cleaners under their own device id during initialization instead for every seperate command
    });
}

function sendCommand(command, args, callback) {

    //TODO : resolve all vacuum cleaners under their own device id during initialization instead for every seperate command

    mirobot.device({
        address: robots[args.device.id].settings.address,
        token: robots[args.device.id].settings.token
    }).then(device => {
        Homey.log("Device with id "+ args.device.id +" resolvec succesfully");

        switch(command) {
            case 'start':
                device.start();
                break;
            case 'pause':
                device.pause();
                break;
            case 'stop':
                device.stop();
                break;
            case 'charge':
                device.charge();
                break;
            case 'spotclean':
                device.spotClean();
                break;
            case 'find':
                device.find();
                break;
            case 'state':
                callback(null, device.state);
                break
            default:
                device.find();
        }

        callback(null, "Command send succesfully");

    }).catch(function (err) {
        Homey.log("Can not resolve device with id "+ args.device.id +" because of error " + err);
        callback(err, null);
    });


}

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.start', function( callback, args ) {
    sendCommand('start', args, callback);
});

Homey.manager('flow').on('action.pause', function( callback, args ) {
    sendCommand('pause', args, callback);
});

Homey.manager('flow').on('action.stop', function( callback, args ) {
    sendCommand('stop', args, callback);
});

Homey.manager('flow').on('action.charge', function( callback, args ) {
    sendCommand('charge', args, callback);
});

Homey.manager('flow').on('action.spotClean', function( callback, args ) {
    sendCommand('charge', args, callback);
});

Homey.manager('flow').on('action.find', function( callback, args ) {
    sendCommand('find', args, callback);
});

// FLOW CONDITION HANDLERS
Homey.manager('flow').on('condition.cleaning', function( callback, args ) {
    sendCommand('state', args, function( err, result ) {
        if (result == 'cleaning') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.charging', function( callback, args ) {
    sendCommand('state', args, function( err, result ) {
        if (result == 'charging') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.returning', function( callback, args ) {
    sendCommand('state', args, function( err, result ) {
        if (result == 'returning') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});

Homey.manager('flow').on('condition.paused', function( callback, args ) {
    sendCommand('state', args, function( err, result ) {
        if (result == 'paused') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
});
