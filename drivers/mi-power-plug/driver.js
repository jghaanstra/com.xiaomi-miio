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
                            const powerConsumed = await device.powerConsumed();
                            const powerLoad = await device.powerLoad();

                            const kwh = powerConsumed.wattHours / 1000;

                            let result = {
                                onoff: power,
                                load: powerLoad.watts,
                                consumed: kwh
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
