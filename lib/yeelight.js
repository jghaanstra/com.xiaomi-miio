const Homey = require('homey');
const dgram = require('dgram');
const advertisements = dgram.createSocket('udp4');

var new_devices = {};
var added_devices = {};
var yeelights = Homey.ManagerDrivers.getDriver('yeelights').getDevices();

/* send discovery message during pair wizard */
exports.fillAddedDevices = function () {
  added_devices = {}
  var yeelights = Homey.ManagerDrivers.getDriver('yeelights').getDevices();
  Object.keys(yeelights).forEach(function(key) {
    added_devices[yeelights[key].getData().id] = {
      id: yeelights[key].getData().id,
      address: yeelights[key].getSetting('address'),
      port: yeelights[key].getSetting('port')
    };
  });
}

/* send discovery message during pair wizard */
exports.discover = function () {
	return new Promise(resolve => {
    var message = 'M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n';
    var broadcast = () => advertisements.send(message, 0, message.length, 1982, "239.255.255.250");
    var broadcastInterval = setInterval(broadcast, 5000);
    broadcast();

    setTimeout(() => {
      clearInterval(broadcastInterval);
      resolve(new_devices);
    }, 6000);
	});
}

/* listen for advertisements when devices come online and at regular interval */
exports.listenUpdates = function () {
  advertisements.bind(1982, function () {
    advertisements.addMembership('239.255.255.250');
    advertisements.setBroadcast(true);
    advertisements.setMulticastTTL(255);
  });

  advertisements.on('message', (message, address) => {
    process.nextTick(function() {
      parseMessage(message)
        .then(result => {
          if (result !== 'no devices') {

            // new devices for pairing
            if (result.message_type == 'discover' && !new_devices.hasOwnProperty(result.device.id) && !added_devices.hasOwnProperty(result.device.id)) {
              new_devices[result.device.id] = result.device;
              console.log('device added to new devices ', result.device.id);
            } else {
              console.log('device not added to new devices ', result.device.id);
              console.log('result.message_type: ', result.message_type);
            }

            Object.keys(yeelights).forEach(function(key) {
              // update ip for changed ip's
              if (result.message_type != 'discover' && yeelights[key].getData().id == result.device.id && (yeelights[key].getSetting('address') != result.device.address || yeelights[key].getSetting('port') != result.device.port) ) {
                yeelights[key].setSettings({address: result.device.address, port: result.device.port});
                console.log('device has changed ip ', result.device.address);
              }

              // new sockets for broken devices
              if (result.message_type != 'discover' && yeelights[key].getData().id == result.device.id && !yeelights[key].isConnected(result.device.id)) {
                yeelights[key].createDeviceSocket(result.device.id);
                console.log('existing device but with broken socket: ', result.device.id)
              }
            });
          } else {
            console.log('No devices found or message not a discovery message');
          }
        })
        .catch(error => {
          console.log(error);
        })
    });
  });

  advertisements.on('error', (error) => {
    console.log(error);
  });
}

/* parse incoming broadcast messages, match them with registered devices and update their state */
function parseMessage(message) {
  return new Promise(function (resolve, reject) {
    try {
      var headers = message.toString();
      var re = /: /gi;
      var re2 = /\r\n/gi;

      if (headers.includes('NOTIFY')) {
        var message_type = 'notification';
      } else {
        var message_type = 'discover';
      }

      if (!headers.includes('ssdp:discover')) {
        headers = headers.split("\r\nLocation:").pop();
        headers = headers.substring(0, headers.indexOf("\r\nname:"));
        headers = 'Location:'+ headers+'';
        headers = headers.replace(re, '": "');
        headers = headers.replace(re2, '",\r\n"');
        headers = '{ "'+ headers +'" }';

        var result = JSON.parse(headers);

        var location = result.Location.split(':');
        var address = location[1].replace('//', '');
        var port = parseInt(location[2], 10);

        if (result.power == 'on') {
          var onoff = true;
        } else {
          var onoff = false;
        }

        var device = {
          id: result.id,
          address: address,
          port: port,
          model: result.model,
          onoff: onoff,
          dim: parseInt(result.bright),
          mode: parseInt(result.color_mode),
          temperature: parseInt(result.ct),
          rgb: parseInt(result.rgb),
          hue: parseInt(result.hue),
          saturation: parseInt(result.sat),
          connected: false
        }

        return resolve({
          message_type: message_type,
          device: device
        });
      } else {
        return resolve('no devices');
      }
    } catch (error) {
      return reject(error);
    }
  })
}

exports.normalize = function (value, min, max) {
	var normalized = (value - min) / (max - min);
	return Number(normalized.toFixed(2));
}

exports.denormalize = function (normalized, min, max) {
	var denormalized = ((1 - normalized) * (max - min) + min);
	return Number(denormalized.toFixed(0));
}
