'use strict';

const Homey = require('homey');
const miio = require('miio');

class PowerPlugDevice extends Homey.Device {

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
                const power = await device.power();

                if (this.getCapabilityValue('onoff') != power) {
                    this.setCapabilityValue('onoff', power);
                }
            }
            getData();

            // TODO: fix measure power and meter power
            if (this.getCapabilityValue('measure_power') != 0) {
                this.setCapabilityValue('measure_power', 0);
            }
            if (this.getCapabilityValue('meter_power') != 0) {
                this.setCapabilityValue('meter_power', 0);
            }
        }, 1000 * interval);
    }

}

module.exports = PowerPlugDevice;
