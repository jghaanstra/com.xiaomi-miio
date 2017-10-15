'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class MiHumidifierDevice extends Homey.Device {

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
                this.setStoreValue('onoff', value);
                this.setCapabilityValue('onoff', value);
                callback(null, value);
            }
        });
    }

    // HELPER FUNCTIONS
    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            util.getHumidifier(this.getSetting('address'), this.getSetting('token'))
                .then(result => {
                    if (this.getStoreValue('onoff') != result.onoff) {
                        this.setStoreValue('onoff', result.onoff);
                        this.setCapabilityValue('onoff', result.onoff);
                    }
                    if (this.getStoreValue('mode') != result.mode) {
                        this.setStoreValue('mode', result.mode);
                    }
                    if (this.getStoreValue('temperature') != result.temperature) {
                        this.setStoreValue('temperature', result.temperature);
                        this.setCapabilityValue('measure_temperature', result.temperature);
                    }
                    if (this.getStoreValue('humidity') != result.humidity) {
                        this.setStoreValue('humidity', result.humidity);
                        this.setCapabilityValue('measure_humidity', result.humidity);
                    }
                })
                .catch(error => {
                    this.log(error);
                })
        }, 1000 * interval);
    }

}

module.exports = MiHumidifierDevice;
