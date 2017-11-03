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
                args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}')
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

        // MI ROBOT: CONDITION AND ACTION FLOW CARDS
        // TODO: maintain support for the Mi Robot?
        new Homey.FlowCardCondition('cleaningVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('state', 'cleaning', args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardCondition('chargingVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('state', 'charging', args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardCondition('returningVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('state', 'returning', args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardCondition('pausedVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('state', 'paused', args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('startVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('start', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('pauseVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('pause', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('stopVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('stop', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('chargeVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('charge', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('spotCleanVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('spotclean', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('findVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('find', 0, args.device.getSetting('address'), args.device.getSetting('token'))
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('fanPowerVacuum')
            .register()
            .registerRunListener((args, state) => {
                util.sendCommand('fanPower', args.fanspeed, args.device.getSetting('address'), args.device.getSetting('token'))
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
