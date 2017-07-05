"use strict";

var utils = require('/lib/utils.js');
var dgram = require('dgram');
var advertisements = dgram.createSocket('udp4');
var net = require('net');
var tinycolor = require("tinycolor2");
var yeelights = {};
var temp_devices = {};

var typeCapabilityMap = {
	'mono'     : [ 'onoff', 'dim' ],
	'color'    : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
}

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});

        // start listening for advertisements
        listenUpdates();

        Homey.log('Driver Yeelight Bulbs initialized ...');
    	callback ();
    },
    pair: function (socket) {
        socket.on('list_devices', function (data, callback) {
    		discover().then(devices => {
    			let result = [];
                for (let i in devices) {
                    if(devices[i].model == 'color') {
                        var name = __('yeelight_bulb_color')+ ' (' + devices[i].address + ')';
                    } else {
                        var name = __('yeelight_bulb_white')+ ' (' + devices[i].address + ')';
                    }
                    result.push({
                        name: name,
                        data: {
                            id: devices[i].id,
                            address: devices[i].address,
                            port: devices[i].port,
                            model: devices[i].model
                        },
                        capabilities: typeCapabilityMap[devices[i].model],
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
        delete yeelights[device_data.id];
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
    Homey.manager('drivers').getDriver('yeelight-bulb').getName(device_data, function (err, name) {
        yeelights[device_data.id] = {
            name: name,
            data: {
                id: device_data.id,
                address: device_data.address,
                port: device_data.port,
                model: device_data.model
            },
            state: {
                onoff: true,
                dim: 100,
                mode: 2,
                temperature: 4000,
                rgb: 16711680,
                hue: 359,
                saturation: 100,
                connected: false
            },
            capabilities: typeCapabilityMap[device_data.model],
            socket: null
        }
        createDeviceSocket(device_data);
    })
}

function createDeviceSocket(device_data) {
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
		Homey.log("Yeelight Bulb Color: error creating socket " + error);
	}

    device.socket.on('connect', function() {
        // update state upon connect
        sendCommand(device_data, '{"id":1,"method":"get_prop","params":["power", "bright", "color_mode", "ct", "rgb", "hue", "sat"]}');

        device.state.connected = true;
        module.exports.setAvailable(device_data);
    });

    device.socket.on('error', function(error) {
        device.socket.destroy();
        device.socket = null;
        device.state.connected = false;
        module.exports.setUnavailable(device_data, __('unreachable'));
    });

    process.nextTick(function() {
        device.socket.on('data', function(message, address) {
            var result = message.toString();
            var result = result.replace('{"id":1, "result":["ok"]}','');
            var result = result.replace('\r\n','');
            if (result.includes('props')) {
                var result = JSON.parse(result);
                var key = Object.keys(result.params)[0];

                switch (key) {
                    case 'power':
                        if(result.params.power == 'on') {
                            device.state.onoff = true;
                            module.exports.realtime(device_data, 'onoff', true);
                        } else {
                            device.state.onoff = false;
                            module.exports.realtime(device_data, 'onoff', false);
                        }
                        break;
                    case 'bright':
                        device.state.dim = result.params.bright;
                        var dim = result.params.bright / 100;
                        module.exports.realtime(device_data, 'dim', dim);
                        break;
                    case 'ct':
                        device.state.temperature = result.params.ct;
                        var color_temp = utils.normalize(result.params.ct, 1700, 6500);
                        module.exports.realtime(device_data, 'light_temperature', color_temp);
                        break;
                    case 'rgb':
                        device.state.rgb = result.params.rgb;
                        var color = tinycolor(result.params.rgb.toString(16));
                        var hsv = color.toHsv();
                        var hue = Math.round(hsv.h) / 359;
                        var saturation = Math.round(hsv.s);
                        module.exports.realtime(device_data, 'light_hue', hue);
                        module.exports.realtime(device_data, 'light_saturation', saturation);
                        break;
                    case 'hue':
                        device.state.hue = result.params.hue;
                        var hue = result.params.hue / 359;
                        module.exports.realtime(device_data, 'light_hue', hue);
                        break;
                    case 'sat':
                        device.state.saturation = result.params.sat;
                        var saturation = result.params.sat / 100;
                        module.exports.realtime(device_data, 'light_saturation', saturation);
                        break;
                    case 'color_mode':
                        device.state.mode = result.params.color_mode;
                        if (result.params.color_mode == 2) {
                            module.exports.realtime(device_data, 'light_mode', 'temperature');
                        } else {
                            module.exports.realtime(device_data, 'light_mode', 'color');
                        }
                        break;
                    default:
                        break;
                }
            } else if (result.includes('result')) {
                var result = JSON.parse(result);

                if(result.result[0] == 'on') {
                    device.state.onoff = true;
                } else {
                    device.state.onoff = false;
                }
                device.state.dim = result.result[1];
                device.state.mode = result.result[2];
                device.state.temperature = result.result[3];
                device.state.rgb = result.result[4];
                device.state.hue = result.result[5];
                device.state.saturation = result.result[6];
            }
    	}.bind(this));
    }.bind(this));
}

function listenUpdates() {
    advertisements.bind(1982, function () {
        advertisements.addMembership('239.255.255.250');
        advertisements.setBroadcast(true);
    });

    advertisements.on('message', (message, address) => {
        process.nextTick(function() {
            parseMessage(message, function(error, result) {
                if (error) {
                    Homey.log(error);
                } else {
                    if (!temp_devices.hasOwnProperty(result.device.id)) {
                        temp_devices[result.device.id] = result.device;
                    }
                    if (result.type != 'discover') {
                        if (yeelights.hasOwnProperty(result.device.id)) {
                            var device = getDeviceById(result.device.id);
            			    if (device instanceof Error) return callback(device);

                            createDeviceSocket(device.data);
                        }
                    }
                }
            });
        });
    });

    advertisements.on('error', function(error) {
        Homey.log(error);
    }.bind(this));
}

function discover() {
	return new Promise(resolve => {
        var message = 'M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n';
        var broadcast = () => advertisements.send(message, 0, message.length, 1982, "239.255.255.250");
        var broadcastInterval = setInterval(broadcast, 3000);
        broadcast();

        setTimeout(() => {
            clearInterval(broadcastInterval);
            resolve(temp_devices);
        }, 3000);
	});
}

function parseMessage(message, callback) {
    try {
        var headers = message.toString();
        var re = /: /gi;
        var re2 = /\r\n/gi;

        if (headers.includes('NOTIFY')) {
            var type = 'notification';
        } else {
            var type = 'discover';
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
            saturation: parseInt(result.sat)
        }

        callback(null, {
            type: type,
            device: device
        });
    } catch (error) {
        callback(error, null);
    }
}

function sendCommand(device_data, command) {
    var device = getDeviceByData(device_data);
    if (device instanceof Error) Homey.log("No device for sending command");

	if (device.socket === null) {
		Homey.log('Connection to device broken');
	} else {
        device.socket.write(command + '\r\n');
    }
};

function getDeviceByData(device_data) {
	var device = yeelights[device_data.id];
	if (typeof device === 'undefined') {
		return new Error("invalid_device");
	}
	else {
		return device;
	}
}

function getDeviceById(deviceid) {
	var device = yeelights[deviceid];
	if (typeof device === 'undefined') {
		return new Error("invalid_device");
	}
	else {
		return device;
	}
}
