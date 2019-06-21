"use strict";

const Homey = require('homey');
const yeelight = require('/lib/yeelight.js');

const typeCapabilityMap = {
	'mono'     : [ 'onoff', 'dim' ],
  'mono1'     : [ 'onoff', 'dim' ],
  'ct'       : [ 'onoff', 'dim', 'light_temperature' ],
	'color'    : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'color1'    : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'color2'    : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'stripe'   : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'stripe1'   : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'bslamp'   : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'bslamp1'   : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'ceiling'  : [ 'onoff', 'dim', 'light_temperature', 'light_mode', 'night_mode' ],
  'ceiling1'  : [ 'onoff', 'dim', 'light_temperature', 'light_mode', 'night_mode' ],
  'ceiling2'  : [ 'onoff', 'dim', 'light_temperature', 'light_mode', 'night_mode' ],
  'ceiling3'  : [ 'onoff', 'dim', 'light_temperature', 'light_mode', 'night_mode' ],
  'ceiling4' : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode', 'night_mode' ],
  'ceiling10' : [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
  'desklamp' : [ 'onoff', 'dim', 'light_temperature', 'light_mode' ]
}

const typeIconMap = {
	'mono'     : 'bulb.svg',
  'mono1'     : 'bulb.svg',
	'color'    : 'bulb.svg',
  'color1'    : 'bulb.svg',
  'color2'    : 'bulb.svg',
  'stripe'   : 'strip.svg',
  'stripe1'   : 'strip.svg',
  'bslamp'   : 'bslamp.svg',
  'bslamp1'   : 'bslamp.svg',
  'bslamp2'   : 'bslamp2.svg',
  'ceiling'  : 'ceiling.svg',
  'ceiling1'  : 'ceiling.svg',
  'ceiling2'  : 'ceiling.svg',
  'ceiling3'  : 'ceiling.svg',
  'ceiling4' : 'ceiling4.svg',
  'ceiling10' : 'ceiling10.svg',
  'desklamp' : 'desklamp.svg'
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
          if(result[i].model.startsWith('color')) {
            var name = Homey.__('yeelight_bulb_color')+ ' (' + result[i].address + ')';
          } else if (result[i].model.startsWith('mono')) {
            var name = Homey.__('yeelight_bulb_white')+ ' (' + result[i].address + ')';
          } else if (result[i].model == 'ct') {
            var name = Homey.__('yeelight_bulb_white_v2')+ ' (' + result[i].address + ')';
          } else if (result[i].model.startsWith('stripe')) {
            var name = Homey.__('yeelight_led_strip')+ ' (' + result[i].address + ')';
          } else if (result[i].model.startsWith('bslamp')) {
            var name = Homey.__('yeelight_bedside_lamp')+ ' (' + result[i].address + ')';
          } else if (result[i].model.startsWith('ceiling')) {
            if(result[i].model !== 'ceiling4' && result[i].model !== 'ceiling10') {
              result[i].model = 'ceiling';
            }
            if (result[i].model == 'ceiling10') {
              var name = Homey.__('yeelight_meteorite_light')+ ' (' + result[i].address + ')';
            } else {
              var name = Homey.__('yeelight_ceiling_light')+ ' (' + result[i].address + ')';
            }
          } else if (result[i].model == 'desklamp') {
            var name = Homey.__('yeelight_desklamp')+ ' (' + result[i].address + ')';
          }
          devices.push({
            name: name,
            data: {
              id: result[i].id,
              model: result[i].model
            },
            settings: {
              address: result[i].address,
              port: result[i].port
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
