'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class PhilipsBulbDevice extends Homey.Device {

    onInit() {
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
        this.registerCapabilityListener('light_temperature', this.onCapabilityLightTemperature.bind(this));

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

    onCapabilityDim(value, opts, callback) {
        var brightness = value * 100;
        util.sendCommand('dim', brightness, this.getSetting('address'), this.getSetting('token'), function(error, result) {
            if (error) {
                callback(error, false);
            } else {
                this.setCapabilityValue('dim', value);
                callback(null, value);
            }
        });
    }

    onCapabilityLightTemperature(value, opts, callback) {
        util.sendCommand('colortemperature', value, this.getSetting('address'), this.getSetting('token'), function(error, result) {
            if (error) {
                callback(error, false);
            } else {
                this.setCapabilityValue('light_temperature', value);
                callback(null, value);
            }
        });
    }

    // HELPER FUNCTIONS
    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            util.getPhilipsBulb(this.getSetting('address'), this.getSetting('token'))
                .then(result => {
                    var dim = result.brightness / 100;
                    if (this.getCapabilityValue('onoff') != result.onoff) {
                        this.setCapabilityValue('onoff', result.onoff);
                    }
                    if (this.getCapabilityValue('dim') != dim) {
                        this.setCapabilityValue('dim', dim);
                    }
                    if (this.getCapabilityValue('light_temperature') != result.colorTemperature) {
                        this.setCapabilityValue('light_temperature', result.colorTemperature);
                    }
                })
                .catch(error => {
                    this.log(error);
                })
        }, 1000 * interval);
    }

}

module.exports = PhilipsBulbDevice;
