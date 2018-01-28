"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiHumidifierDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {

                    const getData = async () => {
                        const power = await device.power();
                        const temp = await device.temperature()
                        const rh = await device.relativeHumidity();
                        const mode = await device.mode();

                        let result = {
                            onoff: power,
                            temperature: temp.celcius,
                            humidity: rh,
                            mode: mode
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

module.exports = MiHumidifierDriver;
