"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiRobotDriver extends Homey.Driver {

  onPair(socket) {
    socket.on('testConnection', function(data, callback) {
      miio.device({
          address: data.address,
          token: data.token
        }).then(device => {
          if (device.property('state') == 'charging') {
            var state = 'charging';
          } else if (device.property('state') == 'docking' || device.property('state') == 'full' || device.property('state') == 'returning' || device.property('state') == 'waiting') {
            var state = 'docked';
          } else if (device.property('state') == 'cleaning' || device.property('state') == 'zone-cleaning') {
            var state = 'cleaning';
          } else if (device.property('state') == 'spot-cleaning') {
            var state = 'spot_cleaning';
          } else {
            var state = 'stopped';
          }
          var battery = device.getState('batteryLevel');
          var fanspeed = device.getState('fanSpeed');

          var result = {
            state: state,
            battery: battery,
            fanspeed: fanspeed
          }

          device.find();

          callback(null, result);
        }).catch(function (error) {
          callback(error, null);
        });
    });
  }

}

module.exports = MiRobotDriver;
