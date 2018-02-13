'use strict';

const Homey = require('homey');
const miio = require('miio');

class MiAirPurifierDevice extends Homey.Device {

    onInit() {
        this.createDevice();

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
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
                try {
                    const power = await this.miio.power();
                    const temp = await this.miio.temperature();
                    const rh = await this.miio.relativeHumidity();
                    const aqi = await this.miio.pm2_5();
                    const mode = await this.miio.mode();

                    if (this.getCapabilityValue('onoff') != power) {
                        this.setCapabilityValue('onoff', power);
                    }
                    if (this.getCapabilityValue('measure_temperature') != temp.celcius) {
                        this.setCapabilityValue('measure_temperature', temp.celcius);
                    }
                    if (this.getCapabilityValue('measure_humidity') != rh) {
                        this.setCapabilityValue('measure_humidity', rh);
                    }
                    if (this.getCapabilityValue('measure_pm25') != aqi) {
                        this.setCapabilityValue('measure_pm25', aqi);
                    }
                    if (this.getStoreValue('mode') != mode) {
                        this.setStoreValue('mode', mode);
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

module.exports = MiAirPurifierDevice;
