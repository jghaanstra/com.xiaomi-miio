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
                    const getData = async () => {
                        try {
                            const power = await device.power();

                            let result = {
                                onoff: power
                            }

                            callback(null, result);
                        } catch (error) {
                            callback(error, null);
                        }
                    }
                    getData();
                }).catch(function (error) {
                    callback(error, null);
                });
        });
    }

}

module.exports = PowerPlugDriver;
