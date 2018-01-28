"use strict";

const Homey = require('homey');
const miio = require('miio');

class PhilipsBulbDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {

                    const getData = async () => {
                        const power = await device.power();
                        const brightness = await device.brightness()
                        const colorTemperature = await device.color();

                        let result = {
                            onoff: power,
                            brightness: brightness,
                            colorTemperature: colorTemperature
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

module.exports = PhilipsBulbDriver;
