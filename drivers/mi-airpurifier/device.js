'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class MiAirPurifierDevice extends Homey.Device {

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
        util.sendCommand('toggle', 0, this.getSetting('address'), this.getSetting('token'), function(error, result) {
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
            util.getAirPurifier(this.getSetting('address'), this.getSetting('token'))
                .then(result => {
                    if (this.getCapabilityValue('onoff') != result.onoff) {
                        this.setCapabilityValue('onoff', result.onoff);
                    }
                    if (this.getStoreValue('mode') != result.mode) {
                        this.setStoreValue('mode', result.mode);
                    }
                    if (this.getCapabilityValue('measure_temperature') != result.temperature) {
                        this.setCapabilityValue('measure_temperature', result.temperature);
                    }
                    if (this.getCapabilityValue('measure_humidity') != result.humidity) {
                        this.setCapabilityValue('measure_humidity', result.humidity);
                    }
                    if (this.getCapabilityValue('measure_pm25') != result.aqi) {
                        this.setCapabilityValue('measure_pm25', result.aqi);
                    }
                })
                .catch(error => {
                    this.log(error);
                })
        }, 1000 * interval);
    }

}

module.exports = MiAirPurifierDevice;
