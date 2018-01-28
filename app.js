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

        // MI ROBOT: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardAction('findVacuum')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.find()
                    .then(result => { return Promise.resolve(result) })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('fanPowerVacuum')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.changeFanSpeed(Number(args.fanspeed))
                    .then(result => {
                        args.device.setStoreValue('fanspeed', args.fanspeed);
                        return Promise.resolve(true)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        // MI AIR PURIFIER: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardCondition('poweredAirpurifier')
            .register()
            .registerRunListener((args, state) => {
                if (args.device.setCapabilityValue('onoff')) {
                    return Promise.resolve(true);
                } else {
                    return Promise.reject(false);
                }
            })

        new Homey.FlowCardAction('modeAirpurifier')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.mode(args.mode)
                    .then(result => {
                        args.device.setStoreValue('mode', args.mode);
                        return Promise.resolve(result)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('airpurifierSetFavorite')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.favoriteLevel(args.favorite)
                    .then(result => { return Promise.resolve(result) })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('airpurifierOn')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.setPower(true)
                    .then(result => {
                        args.device.setCapabilityValue('onoff', true);
                        return Promise.resolve(result)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('airpurifierOff')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.setPower(false)
                    .then(result => {
                        args.device.setCapabilityValue('onoff', false);
                        return Promise.resolve(result)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        // MI HUMDIFIER: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardCondition('poweredHumidifier')
            .register()
            .registerRunListener((args, state) => {
                if (args.device.setCapabilityValue('onoff')) {
                    return Promise.resolve(true);
                } else {
                    return Promise.reject(false);
                }
            })

        new Homey.FlowCardAction('modeHumidifier')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.mode(args.mode)
                    .then(result => {
                        args.device.setStoreValue('mode', args.mode);
                        return Promise.resolve(result)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('humidifierOn')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.setPower(true)
                    .then(result => {
                        args.device.setCapabilityValue('onoff', true);
                        return Promise.resolve(result)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('humidifierOff')
            .register()
            .registerRunListener((args, state) => {
                args.device.miio.setPower(false)
                    .then(result => {
                        args.device.setCapabilityValue('onoff', false);
                        return Promise.resolve(result)
                    })
                    .catch(error => { return Promise.reject(error) });
            })

        // PHILIPS EYECARE LAMP: CONDITION AND ACTION FLOW CARDS
        new Homey.FlowCardAction('enableEyecare')
            .register()
            .registerRunListener((args, state) => {
                var eyecare = args.eyecare == 'on' ? true : false;
                args.device.setEyeCare(eyecare)
                    .then(result => { return Promise.resolve(true) })
                    .catch(error => { return Promise.reject(error) });
            })

        new Homey.FlowCardAction('modeEyecare')
            .register()
            .registerRunListener((args, state) => {
                args.device.mode(args.mode)
                    .then(result => { return Promise.resolve(true) })
                    .catch(error => { return Promise.reject(error) });
            })
    }
}

module.exports = XiaomiMiioApp;
