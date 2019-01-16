"use strict";

const Homey = require('homey');
const miio = require('miio');

class MiRobotDevice extends Homey.Device {

  onInit() {
    new Homey.FlowCardTriggerDevice('statusVacuum').register();

    this.createDevice();
    this.setUnavailable(Homey.__('unreachable'));

    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('vacuumcleaner_state', this.onCapabilityVacuumcleanerState.bind(this));
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
    if (this.miio) {
      this.miio.destroy();
    }
  }

  // LISTENERS FOR UPDATING CAPABILITIES
  onCapabilityOnoff(value, opts, callback) {
    if (this.miio) {
      if (value) {
        this.miio.clean()
          .then(result => {
            this.setCapabilityValue('vacuumcleaner_state', 'cleaning');
            callback(null, value)
          })
          .catch(error => { callback(error, false) });
      } else {
        this.miio.stop()
          .then(result => {
            this.setCapabilityValue('vacuumcleaner_state', 'stopped');
            callback(null, value)
          })
          .catch(error => { callback(error, false) });
      }
    } else {
       this.setUnavailable(Homey.__('unreachable'));
       this.createDevice();
       callback('Device unreachable, please try again ...', false)
    }
  }

  onCapabilityVacuumcleanerState(value, opts, callback) {
    if (this.miio) {
      switch (value) {
        case "cleaning":
          this.miio.activateCleaning()
            .then(result => {
              this.setCapabilityValue('onoff', true);
              callback(null, value);
            })
            .catch(error => { callback(error, false) });
          break;
        case "spot_cleaning":
          this.miio.activateSpotClean()
            .then(result => {
              this.setCapabilityValue('onoff', true);
              callback(null, value);
            })
            .catch(error => { callback(error, false) });
          break;
        case "stopped":
          this.miio.pause()
            .then(result => {
              this.setCapabilityValue('onoff', false);
              callback(null, value);
            })
            .catch(error => { callback(error, false) });
          break;
        case "docked":
        case "charging":
          this.miio.pause()
            .catch(error => { callback(error, false) });
          setTimeout(() => {
            this.miio.activateCharging()
              .then(result => {
                this.setCapabilityValue('onoff', false);
                callback(null, value);
              })
              .catch(error => { callback(error, false) });
          }, 4000)
          break;
        default:
          this.log("Not a valid vacuumcleaner_state");
      }
    } else {
       this.setUnavailable(Homey.__('unreachable'));
       this.createDevice();
       callback('Device unreachable, please try again ...', false)
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
          var battery = this.miio.getState('batteryLevel');
          var fanspeed = this.miio.getState('fanSpeed');

          if (this.miio.property('state') == 'charging' && battery !== 100) {
            var onoff = false;
            var state = 'charging';
          } else if (this.miio.property('state') == 'docking' || this.miio.property('state') == 'full' || this.miio.property('state') == 'returning' || this.miio.property('state') == 'waiting' || this.miio.property('state') == 'charging') {
            var onoff = false;
            var state = 'docked';
          } else if (this.miio.property('state') == 'cleaning' || this.miio.property('state') == 'zone-cleaning') {
            var onoff = true;
            var state = 'cleaning';
          } else if (this.miio.property('state') == 'spot-cleaning') {
            var onoff = true;
            var state = 'spot_cleaning';
          } else {
            var onoff = false;
            var state = 'stopped';
          }

          if (this.getCapabilityValue('onoff') != onoff) {
            this.setCapabilityValue('onoff', onoff);
          }
          if (this.getCapabilityValue('vacuumcleaner_state') != state) {
            this.setCapabilityValue('vacuumcleaner_state', state);
          }
          if (this.getCapabilityValue('measure_battery') != battery) {
            this.setCapabilityValue('measure_battery', battery);
          }
          if (this.getStoreValue('fanspeed') != fanspeed) {
            this.setStoreValue('fanspeed', fanspeed);
          }
          if (this.getStoreValue('state') != this.miio.property('state')) {
            this.setStoreValue('state', this.miio.property('state'));
            Homey.ManagerFlow.getCard('trigger', 'statusVacuum').trigger(this, {status: this.miio.property('state')}, {})
          }
        }
        catch (error) {
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
}

module.exports = MiRobotDevice;
