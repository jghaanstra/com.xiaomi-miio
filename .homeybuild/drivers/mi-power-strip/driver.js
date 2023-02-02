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
                            const powerData = await this.miio.call('get_prop', ['power']);
                            const powerloadData = await this.miio.call('get_prop', ['power_consume_rate']);
                            const powerconsumed = 0;
                            
                            const powerState = powerData[0] === 'on';
                            const powerLoad = powerloadData ? powerloadData[0] : 0;

                            let result = {
                                onoff: power,
                                powerload: powerload,
                                powerconsumed: powerconsumed
                            };

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
