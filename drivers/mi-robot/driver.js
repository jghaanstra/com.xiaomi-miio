"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiRobotDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {
                    if (device.getState('charging')) {
                        var state = 'charging';
                    } else {
                        var state = 'cleaning';
                    }
                    var battery = device.getState('batteryLevel');
                    var fanspeed = device.getState('fanSpeed');

                    var result = {
                        state: state,
                        battery: battery,
                        fanspeed: fanspeed
                    }

                    device.find();

                    callback(null, result);
                }).catch(function (error) {
                    callback(error, null);
                });
        });
    }

}

module.exports = MiRobotDriver;
