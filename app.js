'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');
const tinycolor = require('tinycolor2');

class XiaomiMiioApp extends Homey.App {

  onInit() {
    this.log('Initializing Xiaomi Mi Home app ...');

    // YEELIGHTS: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardCondition('yeelightNightmode')
      .register()
      .registerRunListener((args, state) => {
        return args.device.getCapabilityValue('night_mode');
      })

    new Homey.FlowCardAction('yeelightDefault')
      .register()
      .registerRunListener((args, state) => {
        return args.device.sendCommand(args.device.getData().id, '{"id":1,"method":"set_default","params":[]}');
      })

    new Homey.FlowCardAction('yeelightFlowBrightness')
      .register()
      .registerRunListener((args, state) => {
        return args.device.sendCommand(args.device.getData().id, '{"id":1,"method":"start_cf","params":[1, '+ args.action +', "'+ args.duration +', 2, '+ args.temperature +', '+ args.brightness +'"]}');
      })

    new Homey.FlowCardAction('yeelightTemperatureScene')
      .register()
      .registerRunListener((args, state) => {
        return args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["ct", '+ args.temperature +', '+ args.brightness +']}');
      })

    new Homey.FlowCardAction('yeelightColorScene')
      .register()
      .registerRunListener((args, state) => {
        const color = tinycolor(args.color);
        const rgb = color.toRgb();
        const colordecimal = (rgb.r * 65536) + (rgb.g * 256) + rgb.b;
        if (args.device.getData().model == 'ceiling4' || args.device.getData().model == 'ceiling10') {
          return args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"bg_set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}');
        } else {
          return args.device.sendCommand(args.device.getData().id, '{"id":1, "method":"set_scene", "params":["color", '+ colordecimal +', '+ args.brightness +']}');
        }
      })

    new Homey.FlowCardAction('yeelightCustomCommand')
      .register()
      .registerRunListener((args, state) => {
        return args.device.sendCommand(args.device.getData().id, args.command);
      })

    new Homey.FlowCardAction('yeelightNightMode')
      .register()
      .registerRunListener((args, state) => {
        const night_mode = args.mode == 'night'
        return args.device.triggerCapabilityListener('night_mode', night_mode);
      })

    // MI ROBOT: ACTION FLOW CARDS
    new Homey.FlowCardAction('findVacuum')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.find();
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    new Homey.FlowCardAction('fanPowerVacuum')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.changeFanSpeed(Number(args.fanspeed)).then(result => {
            return args.device.setStoreValue('fanspeed', args.fanspeed);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    new Homey.FlowCardAction('goToTargetVacuum')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.goToTarget([args.xcoordinate, args.ycoordinate]);
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    new Homey.FlowCardAction('cleanZoneVacuum')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          try {
            const zones = JSON.parse("[" + args.zones + "]");
            return args.device.miio.activateZoneClean(zones);
          } catch (error) {
            return Promise.reject(new Error('Invalid JSON coordinates ...'));
          }
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    // MI AIR PURIFIER: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardCondition('poweredAirpurifier')
      .register()
      .registerRunListener((args, state) => {
        return args.device.getCapabilityValue('onoff');
      })

    new Homey.FlowCardAction('modeAirpurifier')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.mode(args.mode).then(result => {
            return args.device.setStoreValue('mode', args.mode);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    new Homey.FlowCardAction('airpurifierSetFavorite')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.setFavoriteLevel(Number(args.favorite));
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    /* DEPRECATED */
    new Homey.FlowCardAction('airpurifierOn')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.setPower(true).then(result => {
            return args.device.setCapabilityValue('onoff', true);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    /* DEPRECATED */
    new Homey.FlowCardAction('airpurifierOff')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.setPower(false).then(result => {
            return args.device.setCapabilityValue('onoff', false);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    // MI HUMDIFIER: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardCondition('poweredHumidifier')
      .register()
      .registerRunListener((args, state) => {
        return args.device.getCapabilityValue('onoff');
      })

    new Homey.FlowCardAction('modeHumidifier')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.mode(args.mode).then(result => {
            return args.device.setStoreValue('mode', args.mode);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    new Homey.FlowCardAction('ledAirpurifierHumidifier')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.changeLEDBrightness(args.brightness);
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    /* DEPRECATED */
    new Homey.FlowCardAction('humidifierOn')
      .register()
      .registerRunListener((args, state) => {
        return args.device.miio.setPower(true)
          .then(result => {
            return args.device.setCapabilityValue('onoff', true);
          });
      })

    /* DEPRECATED */
    new Homey.FlowCardAction('humidifierOff')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.miio.setPower(false).then(result => {
            return args.device.setCapabilityValue('onoff', false);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })


    // PHILIPS EYECARE LAMP: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardAction('enableEyecare')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          const eyecare = args.eyecare == 'on' ? true : false;
          return args.device.setEyeCare(eyecare).then(result => {
            return args.device.setStoreValue('eyecare', eyecare);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    new Homey.FlowCardAction('modeEyecare')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          return args.device.mode(args.mode).then(result => {
            return args.device.setStoreValue('mode', args.mode);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })

    // GATEWAY: CONDITION AND ACTION FLOW CARDS
    new Homey.FlowCardAction('armGateway')
      .register()
      .registerRunListener((args, state) => {
        if (args.device.miio) {
          const alarm = args.alarm == 'armed' ? true : false;
          return args.device.miio.setArming(alarm).then(result => {
            return args.device.setCapabilityValue('homealarm_state', args.alarm);
          });
        } else {
          return Promise.reject(new Error('Device unreachable, please try again ...'));
        }
      })
  }
}

module.exports = XiaomiMiioApp;
