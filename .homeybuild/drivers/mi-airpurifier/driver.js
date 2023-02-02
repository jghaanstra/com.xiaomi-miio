"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiAirPurifierDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {
                    const getData = async () => {
                        try {
                            const power = await device.power();
                            const temp = await device.temperature();
                            const rh = await device.relativeHumidity();
                            const aqi = await device.pm2_5();
                            const mode = await device.mode();

                            let result = {
                                onoff: power,
                                temperature: temp.value,
                                humidity: rh,
                                aqi: aqi,
                                mode: mode
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

module.exports = MiAirPurifierDriver;
