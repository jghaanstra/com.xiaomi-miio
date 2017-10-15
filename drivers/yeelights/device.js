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
        this.setStoreValue('onoff', value);
        callback(null, value);
    }

    onCapabilityDim(value, opts, callback) {
        var brightness = value * 100;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_bright","params":['+ brightness +', "smooth", 500]}');
        this.setStoreValue('dim', brightness);
        callback(null, value);
    }

    onCapabilityLightHue(value, opts, callback) {
        var hue = value * 359;
        var brightness = this.getStoreValue('dim') / 100;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_hsv","params":['+ hue +','+ this.getStoreValue('saturation') +', "smooth", 500]}');
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_bright","params":['+ brightness +', "smooth", 500]}');
        this.setStoreValue('hue', hue);
        this.setStoreValue('mode', 3);
        callback(null, value);
    }

    onCapabilityLightSaturation(value, opts, callback) {
        var saturation = value * 100;
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_hsv","params":['+ this.getStoreValue('hue') +','+ saturation +', "smooth", 500]}');
        this.setStoreValue('saturation', saturation);
        this.setStoreValue('mode', 3);
        callback(null, value);
    }

    onCapabilityLightTemperature(value, opts, callback) {
        var color_temp = yeelight.denormalize(value, 1700, 6500);
        this.sendCommand(this.getData().id, '{"id":1,"method":"set_ct_abx","params":['+ color_temp +', "smooth", 500]}');
        this.setStoreValue('temperature', color_temp);
        this.setStoreValue('mode', 2);
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
                var result = result.replace('\r\n','');
                var result = result.replace(/{"id":1, "result":["ok"]}/g,'');

                if (result.includes('props')) {
                    try {
                        var result = JSON.parse(result);
                        var key = Object.keys(result.params)[0];

                        switch (key) {
                            case 'power':
                                if(result.params.power == 'on') {
                                    device.setStoreValue('onoff', true);
                                    device.setCapabilityValue('onoff', true);
                                } else {
                                    device.setStoreValue('onoff', false);
                                    device.setCapabilityValue('onoff', false);
                                }
                                break;
                            case 'bright':
                                device.setStoreValue('dim', result.params.bright);
                                var dim = result.params.bright / 100;
                                device.setCapabilityValue('dim', dim);
                                break;
                            case 'ct':
                                device.setStoreValue('temperature', result.params.ct);
                                var color_temp = yeelight.normalize(result.params.ct, 1700, 6500);
                                device.setCapabilityValue('light_temperature', color_temp);
                                break;
                            case 'rgb':
                                device.setStoreValue('rgb', result.params.rgb);
                                var color = tinycolor(result.params.rgb.toString(16));
                                var hsv = color.toHsv();
                                var hue = Math.round(hsv.h) / 359;
                                var saturation = Math.round(hsv.s);
                                device.setCapabilityValue('light_hue', hue);
                                device.setCapabilityValue('light_saturation', saturation);
                                break;
                            case 'hue':
                                device.setStoreValue('hue', result.params.hue);
                                var hue = result.params.hue / 359;
                                device.setCapabilityValue('light_hue', hue);
                                break;
                            case 'sat':
                                device.setStoreValue('saturation', result.params.sat);
                                var saturation = result.params.sat / 100;
                                device.setCapabilityValue('light_saturation', saturation);
                                break;
                            case 'color_mode':
                                device.setStoreValue('mode', result.params.color_mode);
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

                        if(result.result[0] == 'on') {
                            device.setStoreValue('onoff', true);
                        } else {
                            device.setStoreValue('onoff', false);
                        }
                        var dim = result.result[1] / 100;
                        var hue = result.result[5] / 359;
                        var saturation = result.result[6] / 100;
                        var color_temp = yeelight.normalize(result.result[3], 1700, 6500);

                        device.setStoreValue('dim', result.result[1]);
                        device.setCapabilityValue('dim', dim);
                        device.setStoreValue('mode', result.result[2]);
                        device.setStoreValue('temperature', result.result[3]);
                        device.setCapabilityValue('light_temperature', color_temp);
                        device.setStoreValue('rgb', result.result[4]);
                        device.setStoreValue('hue', result.result[5]);
                        device.setCapabilityValue('light_hue', hue);
                        device.setStoreValue('saturation', result.result[6]);
                        device.setCapabilityValue('light_saturation', saturation);
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
