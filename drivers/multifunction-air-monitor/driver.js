"use strict";

const Homey = require('homey');
const miio = require('miio');

function getAllMethodNames(obj) {
  let methods = new Set();
  while (obj = Reflect.getPrototypeOf(obj)) {
    let keys = Reflect.ownKeys(obj)
    keys.forEach((k) => methods.add(k));
  }
  return methods;
}

class MiAirMonitorDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            miio.device({
                    address: data.address,
                    token: data.token
                }).then(device => {
                    const getData = async () => {
                        try {
                            const result = await device.call('get_air_data', []);
                            callback(null, result);
                        } catch (error) {
                            callback(error, null);
                        }
                    }
                    getData();
                }).catch(function (error) {
                  console.log('err', error);
                    callback(error, null);
                });
        });
    }

}

module.exports = MiAirMonitorDriver;
