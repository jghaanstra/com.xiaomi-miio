"use strict";

const Homey = require('homey');
const yeelight = require('/lib/yeelight.js');

const typeCapabilityMap = {
	'mono'     : [ 'onoff', 'dim' ],
	'color'    : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
    'stripe'   : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
    'bslamp'   : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
    'ceiling'  : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
    'ceiling4' : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
}

const typeIconMap = {
	'mono'    : 'bulb.svg',
	'color'   : 'bulb.svg',
    'stripe'  : 'strip.svg',
    'bslamp'  : 'bslamp.svg',
    'ceiling' : 'ceiling.svg',
    'ceiling4': 'ceiling4.svg'
}

class YeelightDriver extends Homey.Driver {

    onInit() {
        yeelight.listenUpdates();
    }

    onPairListDevices (data, callback) {
        yeelight.discover()
            .then(result => {
                let devices = [];
                for (let i in result) {
                    if(result[i].model == 'color') {
                        var name = Homey.__('yeelight_bulb_color')+ ' (' + result[i].address + ')';
                    } else if (result[i].model == 'mono') {
                        var name = Homey.__('yeelight_bulb_white')+ ' (' + result[i].address + ')';
                    } else if (result[i].model == 'stripe') {
                        var name = Homey.__('yeelight_led_strip')+ ' (' + result[i].address + ')';
                    } else if (result[i].model == 'bslamp') {
                        var name = Homey.__('yeelight_bedside_lamp')+ ' (' + result[i].address + ')';
                    } else if (result[i].model == 'ceiling' || result[i].model == 'ceiling4') {
                        var name = Homey.__('yeelight_ceiling_light')+ ' (' + result[i].address + ')';
                    }
                    devices.push({
                        name: name,
                        data: {
                            id: result[i].id,
                            address: result[i].address,
                            port: result[i].port,
                            model: result[i].model
                        },
                        capabilities: typeCapabilityMap[result[i].model],
                        icon: typeIconMap[result[i].model]
                    });
                }
                callback(null, devices);
            });

    }

}

module.exports = YeelightDriver;
