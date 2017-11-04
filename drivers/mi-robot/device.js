'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class MiRobotDevice extends Homey.Device {

    onInit() {
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('vacuumcleaner_state', this.onCapabilityVacuumcleanerState.bind(this));

        var interval = this.getSetting('polling') || 60;
        this.pollDevice(interval);
    }

    onAdded() {
        var interval = this.getSetting('polling') || 60;
        this.pollDevice(interval);
    }

    onDeleted() {
        clearInterval(this.pollingInterval);
    }

    // LISTENERS FOR UPDATING CAPABILITIES
    onCapabilityOnoff(value, opts, callback) {
        util.sendCommand('toggle', 0, this.getSetting('address'), this.getSetting('token'), function(error, result) {
            if (error) {
                callback(error, false);
            } else {
                this.setCapabilityValue('onoff', value);
                callback(null, value);
            }
        });
    }

    onCapabilityVacuumcleanerState(value, opts, callback) {
        switch (value) {
            case "cleaning":
                var vacuum_state = 'start';
                break;
            case "spot_cleaning":
                var vacuum_state = 'spotclean';
                break;
            case "stopped":
                var vacuum_state = 'stop';
                break;
            case "docked":
            case "charging":
                var vacuum_state = 'charge';
                break;
            default:
                this.log("Not a valid vacuumcleaner_state");

            if (vacuum_state) {
                util.sendCommand(vacuum_state, 0, this.getSetting('address'), this.getSetting('token'), function(error, result) {
                    if (error) {
                        callback(error, false);
                    } else {
                        this.setCapabilityValue('vacuumcleaner_state', value);
                        callback(null, true);
                    }
                });
            }
        }
    }

    // HELPER FUNCTIONS
    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            util.getVacuumCleaner(this.getSetting('address'), this.getSetting('token'))
                .then(result => {
                    if (this.getCapabilityValue('onoff') != result.onoff) {
                        this.setCapabilityValue('onoff', result.onoff);
                    }
                    if (this.getCapabilityValue('measure_battery') != result.battery) {
                        this.setCapabilityValue('measure_battery', result.battery);
                    }

                    var vacuumcleanerState = this.getCapabilityValue('vacuumcleaner_state');

                    switch (result.state) {
                        case 'cleaning':
                        case 'returning':
                            if (vacuumcleanerState != 'cleaning') {
                                this.setCapabilityValue('vacuumcleaner_state', 'cleaning');
                            }
                            break;
                        case 'spot-cleaning':
                            if (vacuumcleanerState != 'spot_cleaning') {
                                this.setCapabilityValue('vacuumcleaner_state', 'spot_cleaning');
                            }
                            break;
                        case 'charging':
                            if (vacuumcleanerState != 'charging') {
                                this.setCapabilityValue('vacuumcleaner_state', 'charging');
                            }
                            break;
                        case 'paused':
                            if (vacuumcleanerState != 'stopped') {
                                this.setCapabilityValue('vacuumcleaner_state', 'stopped');
                            }
                            break;
                        default:
                            vacuumcleanerState = 'stopped';
                            this.setCapabilityValue('vacuumcleaner_state', 'stopped');
                    }

                })
                .catch(error => {
                    this.log(error);
                })
        }, 1000 * interval);
    }

}

module.exports = MiRobotDevice;
