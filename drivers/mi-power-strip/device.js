'use strict';

const Homey = require('homey');
const miio = require('miio');

class PowerStripDevice extends Homey.Device {

    onInit() {
        this.createDevice();

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    }

    onDeleted() {
        clearInterval(this.pollingInterval);
    }

    // LISTENERS FOR UPDATING CAPABILITIES
    onCapabilityOnoff(value, opts, callback) {
        this.miio.setPower(value)
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

                var interval = this.getSetting('polling') || 30;
                this.pollDevice(interval);
        }).catch(function (error) {
            return reject(error);
        });
    }

    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            const getData = async () => {
                try {
                    // TODO: implement measure_power and meter_power capability
                    const power = await this.miio.power();
                    const powerload = 0;
                    const powerconsumed = 0;

                    if (this.getCapabilityValue('onoff') != power) {
                        this.setCapabilityValue('onoff', power);
                    }
                    if (this.getCapabilityValue('measure_power') != powerload) {
                        this.setCapabilityValue('measure_power', powerload);
                    }
                    if (this.getCapabilityValue('meter_power') != powerconsumed) {
                        this.setCapabilityValue('meter_power', powerconsumed);
                    }
                    if (!this.getAvailable()) {
                        this.setAvailable();
                    }
                } catch (error) {
                    this.setUnavailable(Homey.__('unreachable'));
                    this.log(error);
                }
            }
            getData();
        }, 1000 * interval);
    }

}

module.exports = PowerStripDevice;
