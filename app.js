"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');
const tinycolor = require("tinycolor2");

class XiaomiMiioApp extends Homey.App {

    onInit() {
        this.log('Initializing Xiaomi Mi Home app ...');

        // YEELIGHTS: ACTION FLOW CARDS
        new Homey.FlowCardAction('yeelightDefault')
            .register()
            .registerRunListener((args, state) => {
                args.device.sendCommand(args.device.getData().id, '{"id":1,"method":"set_default","params":[]}')
            })

        new Homey.FlowCardAction('yeelightFlowBrightness')
            .register()
            .registerRunListener((args, state) => {
                args.device.sendCommand(args.device.getData().id, '{"id":1,"method":"start_cf","params":[1, '+ args.action +', "'+ args.duration +', 2, '+ args.temperature +', '+ args.brightness +'"]}')
            })

        new Homey.FlowCardAction('yeelightTemperatureScene')
            .register()
            .registerRunListener((args, state) => {
                args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["ct", '+ args.temperature +', '+ args.brightness +']}')
            })

        new Homey.FlowCardAction('yeelightColorScene')
            .register()
            .registerRunListener((args, state) => {
                var color = tinycolor(args.color);
                var rgb = color.toRgb();
                var colordecimal = (rgb.r * 65536) + (rgb.g * 256) + rgb.b;
                if(args.device.getData().model == 'ceiling4') {
                    args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"bg_set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}')
                } else {
                    args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}')
                }
            })

        new Homey.FlowCardAction('yeelightCustomCommand')
            .register()
            .registerRunListener((args, state) => {
                args.device.sendCommand(args.device.getData().id, args.command)
            })

        // MI AIR PURIFIER: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardCondition('poweredAirpurifier')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('powered', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('modeAirpurifier')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('mode', args.mode, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('airpurifierOn')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('turnon', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('airpurifierOff')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('turnoff', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        // MI HUMDIFIER: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardCondition('poweredHumidifier')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('powered', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('modeHumidifier')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('mode', args.mode, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('humidifierOn')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('turnon', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('humidifierOff')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('turnoff', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        // PHILIPS EYECARE LAMP: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardAction('enableEyecare')
            .register()
            .registerRunListener((args, state) => {
                var eyecare = args.eyecare == 'on' ? true : false;
                util.sendCommand('eyecare', eyecare, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('modeEyecare')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('mode', args.mode, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })
    }
}

module.exports = XiaomiMiioApp;
