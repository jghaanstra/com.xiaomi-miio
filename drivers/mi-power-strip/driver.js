"use strict";

const Homey = require('homey');
const miio = require('miio');

class PowerStripDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {
                    const getData = async () => {
                        try {
                            // TODO: implement measure_power and meter_power capability
                            const power = await device.power();
                            const powerload = 0;
                            const powerconsumed = 0;

                            let result = {
                                onoff: power,
                                powerload: powerload,
                                powerconsumed: powerconsumed
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

module.exports = PowerStripDriver;
