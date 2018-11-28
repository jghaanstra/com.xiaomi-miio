const Homey = require('homey');
const dgram = require('dgram');
const advertisements = dgram.createSocket('udp4');

var temp_devices = {};

/* send discovery message during pair wizard */
exports.discover = function () {
	return new Promise(resolve => {
    var message = 'M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n';
    var broadcast = () => advertisements.send(message, 0, message.length, 1982, "239.255.255.250");
    var broadcastInterval = setInterval(broadcast, 4000);
    broadcast();

    setTimeout(() => {
      clearInterval(broadcastInterval);
      resolve(temp_devices);
    }, 4000);
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
          if (!temp_devices.hasOwnProperty(result.device.id)) {
            temp_devices[result.device.id] = result.device;
          }
          if (result.message_type != 'discover') {
            var yeelights = Homey.ManagerDrivers.getDriver('yeelights').getDevices();
            Object.keys(yeelights).forEach(function(key) {
              if(yeelights[key].getData().id == result.device.id && !yeelights[key].isConnected(result.device.id)) {
                  yeelights[key].createDeviceSocket(result.device.id);
              }
            });
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
