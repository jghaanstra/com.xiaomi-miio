'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class PowerPlugDevice extends Homey.Device {

    onInit() {
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

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
        if(value == 'on') {
            var power = 'turnon';
        } else {
            var power = 'turnoff';
        }
        util.sendCommand(power, 0, this.getSetting('address'), this.getSetting('token'), function(error, result) {
            if (error) {
                callback(error, false);
            } else {
                this.setCapabilityValue('onoff', value);
                callback(null, value);
            }
        });
    }

    // HELPER FUNCTIONS
    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            util.getPowerPlug(this.getSetting('address'), this.getSetting('token'))
                .then(result => {
                    if (this.getCapabilityValue('onoff') != result.onoff) {
                        this.setCapabilityValue('onoff', result.onoff);
                    }
                    if (this.getCapabilityValue('measure_power') != result.load) {
                        this.setCapabilityValue('measure_power', result.load);
                    }
                    if (this.getCapabilityValue('meter_power') != result.consumed) {
                        this.setCapabilityValue('meter_power', result.consumed);
                    }
                })
                .catch(error => {
                    this.log(error);
                })
        }, 1000 * interval);
    }

}

module.exports = PowerPlugDevice;
