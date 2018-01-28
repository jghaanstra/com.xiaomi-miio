"use strict";

const Homey = require('homey');
const miio = require('miio');

class PowerPlugDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {

                    // TODO: fix measure power and meter power
                    const getData = async () => {
                        const power = await device.power();

                        let result = {
                            onoff: power
                        }

                        callback(null, result);
                    }
                    getData();
                }).catch(function (error) {
                    callback(error, null);
                });
        });
    }

}

module.exports = PowerPlugDriver;
