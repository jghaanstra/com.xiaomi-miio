"use strict";

var utils = require('/lib/utils.js');
var dgram = require('dgram');
var net = require('net');
var yeelights_color = {};

var commands = {
    get_power: '{"id":1,"method":"get_prop","params":["power"]}',
    set_power_on: '{ "id": 1, "method": "set_power", "params":["on", "smooth", 500]}',
    set_power_off: '{ "id": 1, "method": "set_power", "params":["off", "smooth", 500]}'
};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);

            device_data.socket.connect(device_data.port, device_data.address, function() {
                device_data.connected = true;
            }.bind());
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
                            power: devices[i].power,
                            brightness: devices[i].brightness,
                            mode: devices[i].mode,
                            temperature: devices[i].temperature,
                            rgb: devices[i].rgb,
                            hue: devices[i].hue,
                            saturation: devices[i].saturation,
                            connected: false,
                            socket: null
                        }
                    });
                }
    			callback(null, result);
    		});
    	});
    },
    added: function (device_data, callback) {
        initDevice( device_data );
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

                if(device.power == 'on') {
                    return callback(null, true);
                } else {
                    return callback(null, false);
                }
    		},
    		set: function (device_data, onoff, callback) {
                var device = getDeviceByData(device_data);
			    if (device instanceof Error) return callback(device);

                if (onoff) {
                    sendCommand(device, commands.set_power_on);
                    device.power = 'on';
					module.exports.realtime(device_data, 'onoff', true);
					callback(null, onoff);
				} else {
                    sendCommand(device, commands.set_power_off);
                    device.power = 'off';
					module.exports.realtime(device_data, 'onoff', false);
					callback(null, onoff);
                }
    		}
    	}
        /*dim: {
		    get: function (device_data, callback) {
                utils.sendCommand('brightness', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, dim, callback) {
                utils.sendCommand('setbrightness', dim, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, dim);
                    } else {
                        module.exports.realtime(device_data, 'dim', dim);
                        callback(null, dim);
                    }
                });
            }
        },
        light_hue: {
		    get: function (device_data, callback) {
                utils.sendCommand('hue', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, light_hue, callback) {
                utils.sendCommand('sethue', light_hue, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, light_hue);
                    } else {
                        callback(null, light_hue);
                    }
                });
            }
        },
        light_saturation: {
		    get: function (device_data, callback) {
                utils.sendCommand('saturation', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, light_saturation, callback) {
                utils.sendCommand('setsaturation', light_saturation, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, light_saturation);
                    } else {
                        callback(null, light_saturation);
                    }
                });
            }
        },
        light_temperature: {
		    get: function (device_data, callback) {
                utils.sendCommand('colortemperature', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, light_temperature, callback) {
                utils.sendCommand('setcolortemperature', light_temperature, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, light_temperature);
                    } else {
                        module.exports.realtime(device_data, 'light_temperature', light_temperature);
                        callback(null, light_temperature);
                    }
                });
            }
        },
        light_mode: {
		    get: function (device_data, callback) {
                utils.sendCommand('colormode', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, 'color');
                    } else {
                        if (result == 'colorTemperature') {
                            callback(null, 'temperature');
                        } else {
                            callback(null, 'color');
                        }
                    }
                });
            }
        }*/
    }
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    createSocket(device_data).then(device_data => {
        yeelights_color[device_data.id] = {
            name: "Yeelight Bulb Color on " + device_data.address,
            data: device_data
        }
    }).catch(error => {
        Homey.log('Devices not correctly initialized');
    });
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

function createSocket (device_data) {
    return new Promise(function (resolve, reject) {
        try {
            if (device_data.connected === false && device_data.socket === null) {
        		device_data.socket = new net.Socket();
                resolve(device_data);
        	}
        } catch (err) {
			Homey.log("Yeelight Color Bulb: error creating socket " + err);
			reject('no socket created');
		}
    });
}

function discover() {
	return new Promise(resolve => {
		const result = {};
		try {
			const socket = dgram.createSocket('udp4');
			socket.bind(function () {
				socket.setBroadcast(true);
			});

			socket.on('listening', () => {
                var message = 'M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n'
				const broadcast = () => socket.send(message, 0, message.length, 1982, "239.255.255.250");
				const broadcastInterval = setInterval(broadcast, 3000);
				broadcast();

				setTimeout(() => {
					clearInterval(broadcastInterval);
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
                        var tmp = headers[i].slice(10).split(':');
                        device.address = tmp[1].replace('//', '');
                        device.port = parseInt(tmp[2], 10);
                    }
                    if (headers[i].indexOf("power:") >= 0)
                        device.power = headers[i].slice(7);
                    if (headers[i].indexOf("bright:") >= 0)
                        device.brightness = headers[i].slice(8);
                    if (headers[i].indexOf("color_mode:") >= 0)
                        device.mode = headers[i].slice(12);
                    if (headers[i].indexOf("ct:") >= 0)
                        device.temperature = headers[i].slice(4);
                    if (headers[i].indexOf("rgb:") >= 0)
                        device.rgb = headers[i].slice(5);
                    if (headers[i].indexOf("hue:") >= 0)
                        device.hue = headers[i].slice(5);
                    if (headers[i].indexOf("sat:") >= 0)
                        device.saturation = headers[i].slice(5);

                    if (!result.hasOwnProperty(device.id) && device.id !== undefined) {
                        result[device.id] = device;
                    }
                }
			});
		} catch (err) {
			Homey.log("Yeelight Color Bulb: error starting discovery socket " + err);
			resolve(result);
		}
	});
}

function sendCommand(device_data, command) {
    var device = getDeviceByData(device_data);

	if (device.connected === false && device.socket === null) {
		Homey.log('Connection to device broken');
	}

	device.socket.write(command + '\r\n');
};
