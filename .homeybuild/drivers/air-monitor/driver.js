"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiAirMonitorDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {
                    const getData = async () => {
                        try {
                            const power = await device.power();
                            const battery = await device.batteryLevel();
                            const aqi = await device.pm2_5();

                            let result = {
                                onoff: power,
                                battery: battery,
                                aqi: aqi
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

module.exports = MiAirMonitorDriver;
