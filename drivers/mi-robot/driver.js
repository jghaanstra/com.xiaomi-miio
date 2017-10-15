"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class MiRobotDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('test-connection', function(data, callback) {
            util.sendCommand('find', 0, data.address, data.token)
                .then(result => {
                    callback(null, "Command send succesfully");
                })
                .catch(error => {
                    callback(error, null);
                })
        });
    }

}

module.exports = MiRobotDriver;
