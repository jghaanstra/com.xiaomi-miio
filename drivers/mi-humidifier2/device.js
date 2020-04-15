"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiHumidifier2Device extends Homey.Device {

  onInit() {
    this.humidifier2WaterlevelTrigger = new Homey.FlowCardTriggerDevice('humidifier2Waterlevel').register();
    this.humidifier2ModeTrigger = new Homey.FlowCardTriggerDevice('humidifierMode').register().registerRunListener((args, state) => { 
      return Promise.resolve(args.fanspeed === 'any' || args.fanspeed === state.fanspeed); 
    });

    // if the device has been created with an older version of this app, we need to add capabilities that have been added with updates
    this.addCapability("humidifier_fan_speed");
    this.addCapability("measure_power");

    this.createDevice();
    setTimeout(() => { this.refreshDevice(); }, 60000);

    this.setUnavailable(Homey.__('unreachable'));

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', (value, opts) => {
      if (this.miio) {
        const powerResult = this.miio.setPower(value);

        return powerResult;
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });

    this.registerCapabilityListener('humidifier_fan_speed', (value, opts) => {
      if (this.miio) {
        return this.miio.setMode(value);
      } else {
        this.setUnavailable(Homey.__('unreachable'));
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    });
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
    clearInterval(this.refreshInterval);
    if (this.miio) {
      this.miio.destroy();
    }
  }

  // HELPER FUNCTIONS
  createDevice() {
    miio.device({
      address: this.getSetting('address'),
      token: this.getSetting('token')
    }).then(miiodevice => {
      if (!this.getAvailable()) {
        this.setAvailable();
      }
      
      this.miio = miiodevice;

      var interval = this.getSetting('polling') || 60;
      this.pollDevice(interval);
    }).catch((error) => {
      this.log(error);
      this.setUnavailable(Homey.__('unreachable'));
      setTimeout(() => {
        this.createDevice();
      }, 10000);
    });
  }

  pollDevice(interval) {
    clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(() => {
      const getData = async () => {
        try {
          const power = await this.miio.power();
          const temp = await this.miio.temperature();
          const rh = await this.miio.relativeHumidity();
          const mode = await this.miio.mode();
          const depth = await this.miio.depth();
          const waterlevel = Math.round(depth);

          if(this.getCapabilityValue('onoff') != power)
          {
            this.setCapabilityValue('onoff', power);
          }

          if(this.getCapabilityValue('measure_temperature') != temp.value)
          {
            this.setCapabilityValue('measure_temperature', temp.value);
          }

          if(this.getCapabilityValue('measure_humidity') != rh)
          {
            this.setCapabilityValue('measure_humidity', rh);
          }

          const previous_waterlevel = this.getCapabilityValue('measure_waterlevel');
          if (previous_waterlevel != waterlevel) {
            this.setCapabilityValue('measure_waterlevel', waterlevel);
            this.humidifier2WaterlevelTrigger.trigger(this, { waterlevel: waterlevel, previous_waterlevel: previous_waterlevel });
          }

          const previous_fanspeed = this.getCapabilityValue('humidifier_fan_speed');
          if (previous_fanspeed != mode) {
            this.setCapabilityValue('humidifier_fan_speed', mode);
            this.humidifier2ModeTrigger.trigger(this, { fanspeed: mode, previous_fanspeed: previous_fanspeed }, { fanspeed: mode, previous_fanspeed: previous_fanspeed });
          }

          let powerLoad = 0;
          switch(mode){
            case 'idle':
              powerLoad = 2.4;
              break;
              case 'silent':
                powerLoad = 2.7;
                break;
              case 'medium':
                powerLoad = 3.4;
                break;
              case 'high':
                 powerLoad = 4.8;
                break;
          }
          if(this.getCapabilityValue('measure_power') != powerLoad)
          {
            this.setCapabilityValue('measure_power', powerLoad);
          }

          if (this.getStoreValue('mode') != mode) {
            this.setStoreValue('mode', mode);
          }

          if (!this.getAvailable()) {
            this.setAvailable();
          }

        } catch (error) {
          this.log(error);
          clearInterval(this.pollingInterval);
          this.setUnavailable(Homey.__('unreachable'));
          setTimeout(() => {
            this.createDevice();
          }, 1000 * interval);
        }
      }
      getData();
    }, 1000 * interval);
  }

  refreshDevice() {
    clearInterval(this.refreshInterval);

    this.refreshInterval = setInterval(() => {
      if (this.miio) {
        this.miio.destroy();
      }

      setTimeout(() => {
        this.createDevice();
      }, 2000);
    }, 3600000);
  }
}

module.exports = MiHumidifier2Device;
