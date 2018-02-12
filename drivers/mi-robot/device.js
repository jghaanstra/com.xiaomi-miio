'use strict';

const Homey = require('homey');
const miio = require('miio');

class MiRobotDevice extends Homey.Device {

    onInit() {
        this.createDevice();

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('vacuumcleaner_state', this.onCapabilityVacuumcleanerState.bind(this));
    }

    onDeleted() {
        clearInterval(this.pollingInterval);
        this.miio.destroy();
    }

    // LISTENERS FOR UPDATING CAPABILITIES
    onCapabilityOnoff(value, opts, callback) {
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
    }

    onCapabilityVacuumcleanerState(value, opts, callback) {
        switch (value) {
            case "cleaning":
                this.miio.clean()
                    .then(result => { callback(null, value) })
                    .catch(error => { callback(error, false) });
                break;
            case "spot_cleaning":
                this.miio.cleanSpot()
                    .then(result => { callback(null, value) })
                    .catch(error => { callback(error, false) });
                break;
            case "stopped":
                this.miio.stop()
                    .then(result => { callback(null, value) })
                    .catch(error => { callback(error, false) });
                break;
            case "docked":
            case "charging":
                this.miio.charge()
                    .then(result => { callback(null, value) })
                    .catch(error => { callback(error, false) });
                break;
            default:
                this.log("Not a valid vacuumcleaner_state");
        }
    }

    // HELPER FUNCTIONS
    createDevice() {
        miio.device({
                address: this.getSetting('address'),
                token: this.getSetting('token')
            }).then(miiodevice => {
                this.miio = miiodevice;

                var interval = this.getSetting('polling') || 60;
                this.pollDevice(interval);
        }).catch(function (error) {
            return reject(error);
        });
    }

    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            if (this.miio.property('state') == 'charging') {
                var onoff = false;
                var state = 'charging';
            } else if (this.miio.property('state') == 'docked' || this.miio.property('state') == 'full') {
                var onoff = false;
                var state = 'docked';
            } else if (this.miio.property('state') == 'cleaning' || this.miio.property('state') == 'returning') {
                var onoff = true;
                var state = 'cleaning';
            } else if (this.miio.property('state') == 'waiting' || this.miio.property('state') == 'paused') {
                var onoff = false;
                var state = 'stopped';
            } else if (this.miio.property('state') == 'spot-cleaning') {
                var onoff = true;
                var state = 'spot_cleaning';
            } else {
                var onoff = false;
                var state = 'stopped';
            }
            var battery = this.miio.getState('batteryLevel');
            var fanspeed = this.miio.getState('fanSpeed');

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
        }, 1000 * interval);
    }
}

module.exports = MiRobotDevice;
