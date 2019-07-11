"use strict";

const Homey = require('homey');
const miio = require('miio');

class PhilipsEyecareDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {
                    const getData = async () => {
                        try {
                            const power = await device.power();
                            const brightness = await device.brightness()
                            const mode = await device.mode();
                            const eyecare = await device.eyeCareMode();

                            let result = {
                                onoff: power,
                                brightness: brightness,
                                mode: mode,
                                eyecare: eyecare
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

module.exports = PhilipsEyecareDriver;
