"use strict";

var utils = require('/lib/utils.js');
var dgram = require('dgram');
var net = require('net');
var yeelights_color = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Yeelight Bulb Color initialized ...');
    	callback ();
    },
    pair: function (socket) {
        socket.on('list_devices', function (data, callback) {
    		discover().then(devices => {
    			let result = [];
                for (let i in devices) {
                    result.push({
                        name: "Yeelight Bulb Color on " + devices[i].address,
                        data: {
                            id: devices[i].id,
                            address: devices[i].address,
                            port: devices[i].port,
                            onoff: devices[i].onoff,
                            dim: devices[i].dim,
                            mode: devices[i].mode,
                            temperature: devices[i].temperature,
                            rgb: devices[i].rgb,
                            hue: devices[i].hue,
                            saturation: devices[i].saturation
                        }
                    });
                }
    			callback(null, result);
    		});
    	});
    },
    added: function (device_data, callback) {
        initDevice(device_data);
        callback( null, true );
    },
    deleted: function (device_data, callback) {
        delete yeelights_color[device_data.id];
        callback( null, true );
    },
    capabilities: {
        onoff: {
    		get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);

                return callback(null, device.state.onoff);
    		},
    		set: function (device_data, onoff, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);

                if (onoff) {
                    sendCommand(device_data, '{"id": 1, "method": "set_power", "params":["on", "smooth", 500]}');
                    device.state.onoff = onoff;
					module.exports.realtime(device_data, 'onoff', onoff);
					callback(null, onoff);
				} else {
                    sendCommand(device_data, '{"id": 1, "method": "set_power", "params":["off", "smooth", 500]}');
                    device.state.onoff = onoff;
					module.exports.realtime(device_data, 'onoff', onoff);
					callback(null, device.state.onoff);
                }
    		}
    	},
        dim: {
		    get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var brightness = device.state.dim / 100;
                return callback(null, brightness);
            },
            set: function (device_data, dim, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var brightness = dim * 100;
                sendCommand(device_data, '{"id":1,"method":"set_bright","params":['+ brightness +', "smooth", 500]}');
                device.state.dim = brightness;
                module.exports.realtime(device_data, 'dim', dim);
                callback(null, dim);
            }
        },
        light_hue: {
		    get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var hue = device.state.hue / 359;
                return callback(null, hue);
            },
            set: function (device_data, light_hue, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var hue = light_hue * 359;
                sendCommand(device_data, '{"id":1,"method":"set_hsv","params":['+ hue +','+ device.state.saturation +', "smooth", 500]}');
                device.state.hue = hue;
                device.state.mode = 3;
                module.exports.realtime(device_data, 'light_hue', light_hue);
                module.exports.realtime(device_data, 'light_mode', 'color');
                callback(null, light_hue);
            }
        },
        light_saturation: {
		    get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var saturation = device.state.saturation / 100;
                return callback(null, saturation);
            },
            set: function (device_data, light_saturation, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var saturation = light_saturation * 100;
                sendCommand(device_data, '{"id":1,"method":"set_hsv","params":['+ device.state.hue +','+ saturation +', "smooth", 500]}');
                device.state.saturation = saturation;
                device.state.mode = 3;
                module.exports.realtime(device_data, 'light_saturation', light_saturation);
                module.exports.realtime(device_data, 'light_mode', 'color');
                callback(null, light_saturation);
            }
        },
        light_temperature: {
		    get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var color_temp = utils.normalize(device.state.temperature, 1700, 6500);
                return callback(null, color_temp);
            },
            set: function (device_data, light_temperature, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                var color_temp = utils.denormalize(light_temperature, 1700, 6500);
                sendCommand(device_data, '{"id":1,"method":"set_ct_abx","params":['+ color_temp +', "smooth", 500]}');
                device.state.dim = color_temp;
                device.state.mode = 2;
                module.exports.realtime(device_data, 'light_temperature', light_temperature);
                module.exports.realtime(device_data, 'light_mode', 'temperature');
                callback(null, light_temperature);
            }
        },
        light_mode: {
		    get: function (device_data, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);
                if (device.state.mode == 2) {
                    return callback(null, 'temperature');
                } else {
                    return callback(null, 'color');
                }
            }
        }
    }
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    Homey.manager('drivers').getDriver('yeelight-bulb-color').getName(device_data, function (err, name) {
        yeelights_color[device_data.id] = {
            name: name,
            data: {
                id: device_data.id,
                address: device_data.address,
                port: device_data.port
            },
            state: {
                onoff: device_data.onoff || false,
                dim: device_data.dim || 0,
                mode: device_data.mode || 3,
                temperature: device_data.temperature || 0,
                rgb: device_data.rgb || 0,
                hue: device_data.hue || 0,
                saturation: device_data.saturation || 0,
                connected: false
            },
            socket: null
        }
        createSocket(device_data);
    })
}

function getDeviceByData(device_data) {
	var device = yeelights_color[device_data.id];
	if (typeof device === 'undefined') {
		return new Error("invalid_device");
	}
	else {
		return device;
	}
}

function createSocket(device_data) {
    var device = getDeviceByData(device_data);
    if (device instanceof Error) Homey.log("No device for creating socket");
    try {
        if (device.socket === null) {
    		device.socket = new net.Socket();
            device.socket.connect(device.data.port, device.data.address, function() {
                device.state.connected = true;
            }.bind());
    	}
    } catch (error) {
		Homey.log("Yeelight Color Bulb: error creating socket " + error);
	}
}

function discover() {
	return new Promise(resolve => {
		var result = {};
		try {
			var socket = dgram.createSocket('udp4');
			socket.bind(function () {
				socket.setBroadcast(true);
			});

			socket.on('listening', () => {
                var message = 'M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n'
				var broadcast = () => socket.send(message, 0, message.length, 1982, "239.255.255.250");
				var broadcastInterval = setInterval(broadcast, 3000);
				broadcast();

				setTimeout(() => {
					clearInterval(broadcastInterval);
                    socket.close();
					resolve(result);
				}, 3000);
			});

			socket.on('message', (message, address) => {
                var device = {};
                var headers = message.toString().split('\r\n');
                for (var i = 0; i < headers.length; i++) {

                    if (headers[i].indexOf("id:") >= 0)
                        device.id = headers[i].slice(4);
                    if (headers[i].indexOf("Location:") >= 0) {
                        var location = headers[i].slice(10).split(':');
                        device.address = location[1].replace('//', '');
                        device.port = parseInt(location[2], 10);
                    }
                    if (headers[i].indexOf("power:") >= 0)
                        var power = headers[i].slice(7);
                        if (power == 'on') {
                            device.onoff = true;
                        } else {
                            device.onoff = false;
                        }
                    if (headers[i].indexOf("bright:") >= 0)
                        device.dim = parseInt(headers[i].slice(8));
                    if (headers[i].indexOf("color_mode:") >= 0)
                        device.mode = parseInt(headers[i].slice(12));
                    if (headers[i].indexOf("ct:") >= 0)
                        device.temperature = parseInt(headers[i].slice(4));
                    if (headers[i].indexOf("rgb:") >= 0)
                        device.rgb = parseInt(headers[i].slice(5));
                    if (headers[i].indexOf("hue:") >= 0)
                        device.hue = parseInt(headers[i].slice(5));
                    if (headers[i].indexOf("sat:") >= 0)
                        device.saturation = parseInt(headers[i].slice(5));

                    if (!result.hasOwnProperty(device.id) && device.id !== undefined) {
                        result[device.id] = device;
                    }
                }
			});
		} catch (error) {
			Homey.log("Yeelight Color Bulb: error starting discovery socket " + error);
			resolve(result);
		}
	});
}

function sendCommand(device_data, command) {
    var device = getDeviceByData(device_data);
    if (device instanceof Error) Homey.log("No device for sending command");
	if (device.socket === null) {
		Homey.log('Connection to device broken');
	}
	device.socket.write(command + '\r\n');
};
