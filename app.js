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
        let defaultstate = args.device.sendCommand(args.device.getData().id, '{"id":1,"method":"set_default","params":[]}');
        return Promise.resolve(defaultstate);
      })

    new Homey.FlowCardAction('yeelightFlowBrightness')
      .register()
      .registerRunListener((args, state) => {
        let flow = args.device.sendCommand(args.device.getData().id, '{"id":1,"method":"start_cf","params":[1, '+ args.action +', "'+ args.duration +', 2, '+ args.temperature +', '+ args.brightness +'"]}');
        return Promise.resolve(flow);
      })

    new Homey.FlowCardAction('yeelightTemperatureScene')
      .register()
      .registerRunListener((args, state) => {
        let tempscene = args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["ct", '+ args.temperature +', '+ args.brightness +']}');
        return Promise.resolve(tempscene);
      })

    new Homey.FlowCardAction('yeelightColorScene')
      .register()
      .registerRunListener((args, state) => {
        var color = tinycolor(args.color);
        var rgb = color.toRgb();
        var colordecimal = (rgb.r * 65536) + (rgb.g * 256) + rgb.b;
        if(args.device.getData().model == 'ceiling4') {
          let colorscene = args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"bg_set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}');
          return Promise.resolve(colorscene);
        } else {
          let colorscene = args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}');
          return Promise.resolve(colorscene);
        }
      })

    new Homey.FlowCardAction('yeelightCustomCommand')
      .register()
      .registerRunListener((args, state) => {
        let customcommand = args.device.sendCommand(args.device.getData().id, args.command);
        return Promise.resolve(customcommand);
      })

    new Homey.FlowCardAction('yeelightNightMode')
      .register()
      .registerRunListener((args, state) => {
        if(args.mode == 'night') {
          return args.device.triggerCapabilityListener('night_mode', true);
        } else {
          return args.device.triggerCapabilityListener('night_mode', false);
        }
      })

    // MI ROBOT: ACTION FLOW CARDS
    new Homey.FlowCardAction('findVacuum')
      .register()
      .registerRunListener((args, state) => {
        let found = args.device.miio.find();
        return Promise.resolve(found);
      })

    new Homey.FlowCardAction('fanPowerVacuum')
      .register()
      .registerRunListener((args, state) => {
        let fanspeed = args.device.miio.changeFanSpeed(Number(args.fanspeed))
          .then(result => {
            args.device.setStoreValue('fanspeed', args.fanspeed);
          });
        return Promise.resolve(fanspeed);
      })

    new Homey.FlowCardAction('goToTargetVacuum')
      .register()
      .registerRunListener((args, state) => {
        let target = args.device.miio.goToTarget([args.xcoordinate, args.ycoordinate]);
        return Promise.resolve(target);
      })

    new Homey.FlowCardAction('cleanZoneVacuum')
      .register()
      .registerRunListener((args, state) => {
        var zones = JSON.parse("[" + args.zones + "]");
        let zoneclean = args.device.miio.activateZoneClean(zones);
        return Promise.resolve(zoneclean);
      })

    // MI AIR PURIFIER: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardCondition('poweredAirpurifier')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.getCapabilityValue('onoff')) {
          return Promise.resolve(true);
        } else {
          return Promise.reject(false);
        }
      })

    new Homey.FlowCardAction('modeAirpurifier')
      .register()
      .registerRunListener((args, state) => {
        let mode = args.device.miio.mode(args.mode)
          .then(result => {
            args.device.setStoreValue('mode', args.mode);
          });
        return Promise.resolve(mode);
      })

    new Homey.FlowCardAction('airpurifierSetFavorite')
      .register()
      .registerRunListener((args, state) => {
        let favoriteLevel = args.device.miio.favoriteLevel(args.favorite);
        return Promise.resolve(favoriteLevel);
      })

    new Homey.FlowCardAction('airpurifierOn')
      .register()
      .registerRunListener((args, state) => {
        let onoff = args.device.miio.setPower(true)
          .then(result => {
            args.device.setCapabilityValue('onoff', true);
          });
        return Promise.resolve(onoff);
      })

    new Homey.FlowCardAction('airpurifierOff')
      .register()
      .registerRunListener((args, state) => {
        let power = args.device.miio.setPower(false)
          .then(result => {
            args.device.setCapabilityValue('onoff', false);
          });
        return Promise.resolve(power);
      })

    // MI HUMDIFIER: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardCondition('poweredHumidifier')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.getCapabilityValue('onoff')) {
          return Promise.resolve(true);
        } else {
          return Promise.reject(false);
        }
      })

    new Homey.FlowCardAction('modeHumidifier')
      .register()
      .registerRunListener((args, state) => {
        let mode = args.device.miio.mode(args.mode)
          .then(result => {
            args.device.setStoreValue('mode', args.mode);
          });
        return Promise.resolve(mode);
      })

    new Homey.FlowCardAction('humidifierOn')
      .register()
      .registerRunListener((args, state) => {
        let power = args.device.miio.setPower(true)
          .then(result => {
            args.device.setCapabilityValue('onoff', true);
          });
        return Promise.resolve(power);
      })

    new Homey.FlowCardAction('humidifierOff')
      .register()
      .registerRunListener((args, state) => {
        let power = args.device.miio.setPower(false)
          .then(result => {
            args.device.setCapabilityValue('onoff', false);
          });
        return Promise.resolve(power);
      })

    // PHILIPS EYECARE LAMP: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardAction('enableEyecare')
      .register()
      .registerRunListener((args, state) => {
        var eyecare = args.eyecare == 'on' ? true : false;
        let eye = args.device.setEyeCare(eyecare)
          .then(result => {
            args.device.setStoreValue('eyecare', eyecare);
          });
        return Promise.resolve(eye);
      })

    new Homey.FlowCardAction('modeEyecare')
      .register()
      .registerRunListener((args, state) => {
        let mode = args.device.mode(args.mode)
          .then(result => {
            args.device.setStoreValue('mode', args.mode);
          });
        return Promise.resolve(mode);
      })

    // GATEWAY: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardAction('armGateway')
      .register()
      .registerRunListener((args, state) => {
        var alarm = args.alarm == 'armed' ? true : false;
        let mode = args.device.miio.setArming(alarm)
          .then(result => {
            args.device.setCapabilityValue('homealarm_state', args.alarm);
          });
        return Promise.resolve(mode);
      })
  }
}

module.exports = XiaomiMiioApp;
