'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');
const miio = require('miio');

class PhilipsEyecareDevice extends Homey.Device {

    onInit() {
        this.createDevice();

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
    }

    onDeleted() {
        clearInterval(this.pollingInterval);
        this.miio.destroy();
    }

    // LISTENERS FOR UPDATING CAPABILITIES
    onCapabilityOnoff(value, opts, callback) {
        this.miio.setPower(value)
            .then(result => { callback(null, value) })
            .catch(error => { callback(error, false) });
    }

    onCapabilityDim(value, opts, callback) {
        var brightness = value * 100;
        this.miio.setBrightness(brightness)
            .then(result => { callback(null, value) })
            .catch(error => { callback(error, false) });
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
            const getData = async () => {
                const power = await device.power();
                const brightness = await device.brightness()
                const mode = await device.mode();
                const eyecare = await device.eyeCareMode();

                if (this.getCapabilityValue('onoff') != power) {
                    this.setCapabilityValue('onoff', power);
                }
                var dim = brightness / 100;
                if (this.getCapabilityValue('dim') != dim) {
                    this.setCapabilityValue('dim', dim);
                }
                if (this.getStoreValue('mode') != mode) {
                    this.setStoreValue('mode', mode);
                }
                if (this.getStoreValue('eyecare') != eyecare) {
                    this.setStoreValue('eyecare', eyecare);
                }
            }
            getData();

        }, 1000 * interval);
    }
}

module.exports = PhilipsEyecareDevice;