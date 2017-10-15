"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class MiAirPurifierDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            util.getAirPurifier(data.address, data.token)
                .then(result => {
                    callback(null, result);
                })
                .catch(error => {
                    callback(error, false);
                })
        });
    }

}

module.exports = MiAirPurifierDriver;
