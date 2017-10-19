'use strict';

const Homey = require('homey');
const yeelight = require('/lib/yeelight.js');
const net = require('net');
const dgram = require('dgram');
const advertisements = dgram.createSocket('udp4');
const tinycolor = require("tinycolor2");
var yeelights = {};

class YeelightDevice extends Homey.Device {

    onInit() {
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
        this.registerCapabilityListener('light_hue', this.onCapabilityLightHue.bind(this));
        this.registerCapabilityListener('light_saturation', this.onCapabilityLightSaturation.bind(this));
        //this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], this.onCapabilityHueSaturation.bind(this), 500);
        this.registerCapabilityListener('light_temperature', this.onCapabilityLightTemperature.bind(this));

        this.setStoreValue('connected', false);
        let id = this.getData().id;
        yeelights[id] = {};
        yeelights[id].data = this.getData();
        yeelights[id].socket = null;

        this.createDeviceSocket(id);
    }

    onAdded() {
        this.setStoreValue('connected', false);
        let id = this.getData().id;
        yeelights[id] = {};
        yeelights[id].data = this.getData();
        yeelights[id].socket = null;

        this.createDeviceSocket(id);
    }

    onDeleted() {
        let id = this.getData().id;
        delete yeelights[id];
    }

    // LISTENERS FOR UPDATING CAPABILITIES
    onCapabilityOnoff(value, opts, callback) {
        if (value) {
            this.sendCommand(this.getData().id, '{"id": 1, "method": "set_power", "params":["on", "smooth", 500]}');
        } else {
            this.sendCommand(this.getData().id, '{"id": 1, "method": "set_power", "params":["off", "smooth", 500]}');
        }
        callback(null, value);
    }

    onCapabilityDim(value, opts, callback) {
        var brightness = value * 100;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_bright","params":['+ brightness +', "smooth", 500]}');
        callback(null, value);
    }

    onCapabilityLightHue(value, opts, callback) {
        var hue = value * 359;
        var saturation = this.getCapabilityValue('light_saturation') * 100;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_hsv","params":['+ hue +','+ saturation +', "smooth", 500]}');
        //this.sendCommand(this.getData().id, '{"id":1,"method":"set_bright","params":['+ this.getCapabilityValue('dim') +', "smooth", 500]}');
        callback(null, value);
    }

    onCapabilityLightSaturation(value, opts, callback) {
        var saturation = value * 100;
        var hue = this.getCapabilityValue('light_hue') * 359;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_hsv","params":['+ hue +','+ saturation +', "smooth", 500]}');
        callback(null, value);
    }

    onCapabilityHueSaturation(valueObj, optsObj) {
        var hue = valueObj.light_hue * 359;
        var saturation = valueObj.light_saturation * 100;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_hsv","params":['+ hue +','+ saturation +', "smooth", 500]}');
        return Promise.resolve();
    }

    onCapabilityLightTemperature(value, opts, callback) {
        var color_temp = yeelight.denormalize(value, 1700, 6500);
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_ct_abx","params":['+ color_temp +', "smooth", 500]}');
        callback(null, value);
    }

    // HELPER FUNCTIONS

    /* establish socket with online devices and update state upon connect  */
    createDeviceSocket(id) {

        let device = Homey.ManagerDrivers.getDriver('yeelights').getDevice(yeelights[id].data);

        try {
            if (yeelights[id].socket === null) {
        		yeelights[id].socket = new net.Socket();
                yeelights[id].socket.connect(yeelights[id].data.port, yeelights[id].data.address);
        	}
        } catch (error) {
    		console.log("Yeelight: error creating socket " + error);
    	}

        yeelights[id].socket.on('connect', function() {
            device.setStoreValue('connected', true);
            device.setAvailable();
            yeelights[id].socket.write('{"id":1,"method":"get_prop","params":["power", "bright", "color_mode", "ct", "rgb", "hue", "sat"]}' + '\r\n');
        });

        yeelights[id].socket.on('error', function(error) {
            device.setUnavailable(Homey.__('unreachable'));
            console.log("Yeelight: error on socket "+ error);
        });

        yeelights[id].socket.on('timeout', function() {
            yeelights[id].socket.end(Homey.__('unreachable'));
            device.setUnavailable(Homey.__('unreachable'));
            console.log("Yeelight: time on socket");
        });

        yeelights[id].socket.on('close', function(error) {
            yeelights[id].socket.destroy();
            yeelights[id].socket = null;
            device.setUnavailable(Homey.__('unreachable'));
            device.setStoreValue('connected', false);
        });

        process.nextTick(function() {
            yeelights[id].socket.on('data', function(message, address) {
                var result = message.toString();
                var result = result.replace(/{"id":1, "result":\["ok"\]}/g, "").replace(/\r\n/g,'');

                if (result.includes('props')) {
                    try {
                        var result = JSON.parse(result);
                        var key = Object.keys(result.params)[0];

                        switch (key) {
                            case 'power':
                                if(result.params.power == 'on') {
                                    device.setCapabilityValue('onoff', true);
                                } else {
                                    device.setCapabilityValue('onoff', false);
                                }
                                break;
                            case 'bright':
                                var dim = result.params.bright / 100;
                                device.setCapabilityValue('dim', dim);
                                break;
                            case 'ct':
                                var color_temp = yeelight.normalize(result.params.ct, 1700, 6500);
                                device.setCapabilityValue('light_temperature', color_temp);
                                break;
                            case 'rgb':
                                var color = tinycolor(result.params.rgb.toString(16));
                                var hsv = color.toHsv();
                                var hue = Math.round(hsv.h) / 359;
                                var saturation = Math.round(hsv.s);
                                device.setCapabilityValue('light_hue', hue);
                                device.setCapabilityValue('light_saturation', saturation);
                                break;
                            case 'hue':
                                var hue = result.params.hue / 359;
                                device.setCapabilityValue('light_hue', hue);
                                break;
                            case 'sat':
                                var saturation = result.params.sat / 100;
                                device.setCapabilityValue('light_saturation', saturation);
                                break;
                            case 'color_mode':
                                if (result.params.color_mode == 2) {
                                    device.setCapabilityValue('light_mode', 'temperature');
                                } else {
                                    device.setCapabilityValue('light_mode', 'color');
                                }
                                break;
                            default:
                                break;
                        }

                    } catch (error) {
                        this.log('Unable to process message because of error: '+ error);
                    }
                } else if (result.includes('result')) {
                    try {
                        var result = JSON.parse(result);

                        if (result.result[0] != "ok") {

                            var dim = result.result[1] / 100;
                            var hue = result.result[5] / 359;
                            var saturation = result.result[6] / 100;
                            var color_temp = yeelight.normalize(result.result[3], 1700, 6500);
                            if(result.result[2] == 2) {
                                var color_mode = 'temperature';
                            } else {
                                var color_mode = 'color';
                            }

                            if(result.result[0] == 'on') {
                                device.setCapabilityValue('onoff', true);
                            } else {
                                device.setCapabilityValue('onoff', false);
                            }
                            device.setCapabilityValue('dim', dim);
                            device.setCapabilityValue('light_mode', color_mode);
                            device.setCapabilityValue('light_temperature', color_temp);
                            device.setCapabilityValue('light_hue', hue);
                            device.setCapabilityValue('light_saturation', saturation);
                        }
                    } catch (error) {
                        this.log('Unable to process message because of error: '+ error);
                    }
                }

        	}.bind(this));
        }.bind(this));
    }

    /* send commands to devices using their socket connection */
    sendCommand(id, command) {
    	if (yeelights[id].socket === null) {
    		this.log('Connection to device broken');
            this.createDeviceSocket(id);
    	} else {
            yeelights[id].socket.write(command + '\r\n');
        }
    }

}

module.exports = YeelightDevice;
