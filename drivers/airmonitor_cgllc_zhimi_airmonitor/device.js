'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

/* supported devices */
// https://home.miot-spec.com/spec/zhimi.airmonitor.v1
// https://home.miot-spec.com/spec/cgllc.airmonitor.b1
// https://home.miot-spec.com/spec/cgllc.airmonitor.s1

class AirmonitorZhimiCgllcDevice extends Device {
    async onInit() {
        try {
            if (!this.util) this.util = new Util({ homey: this.homey });

            // GENERIC DEVICE INIT ACTIONS
            this.bootSequence();

            // ADD DEVICES DEPENDANT CAPABILITIES
            if (this.getStoreValue('model') === 'cgllc.airmonitor.s1') {
                if (this.hasCapability('measure_battery')) {
                    this.removeCapability('measure_battery');
                }
                if (this.hasCapability('alarm_battery')) {
                    this.removeCapability('alarm_battery');
                }
            }

            // LISTENERS FOR UPDATING CAPABILITIES
            this.registerCapabilityListener('onoff', async (value) => {
                try {
                    if (this.miio) {
                        return await this.miio.call('set_power', [value ? 'on' : 'off'], { retries: 1 });
                    } else {
                        this.setUnavailable(this.homey.__('unreachable')).catch((error) => {
                            this.error(error);
                        });
                        this.createDevice();
                        return Promise.reject('Device unreachable, please try again ...');
                    }
                } catch (error) {
                    this.error(error);
                    return Promise.reject(error);
                }
            });
        } catch (error) {
            this.error(error);
        }
    }

    async retrieveDeviceData() {
        try {
            /* model specific capabilities */
            switch (this.getStoreValue('model')) {
                case 'cgllc.airmonitor.v1':
                    const result_v1 = await this.miio.call('get_prop', ['power', 'aqi', 'battery']);
                    if (!this.getAvailable()) {
                        await this.setAvailable();
                    }

                    if (!this.hasCapability('measure_pm25')) await this.addCapability('measure_pm25');
                    if (!this.hasCapability('measure_battery')) await this.addCapability('measure_battery');
                    if (!this.hasCapability('alarm_battery')) await this.addCapability('alarm_battery');

                    if (result_v1[0] !== undefined) await this.updateCapabilityValue('onoff', result_v1[0]);
                    if (result_v1[1] !== undefined && result_v1[1] !== 99999) await this.updateCapabilityValue('measure_pm25', parseInt(result_v1[1]));
                    if (result_v1[2] !== undefined) await this.updateCapabilityValue('measure_battery', this.util.clamp(parseInt(result_v1[2]), 0, 100));
                    if (result_v1[2] !== undefined) await this.updateCapabilityValue('alarm_battery', this.util.clamp(parseInt(result_v1[2]), 0, 100) > 20 ? false : true);
                    break;
                case 'cgllc.airmonitor.b1':
                    const result_b1 = await this.miio.call('get_air_data', []);
                    // temporary debug
                    this.log('Retrieved data for cgllc.airmonitor.b1:', result_b1);
                    if (!this.getAvailable()) {
                        await this.setAvailable();
                    }
                    if (!this.hasCapability('measure_tvoc')) {
                        await this.addCapability('measure_tvoc');
                    }

                    if (!this.hasCapability('measure_pm25')) await this.addCapability('measure_pm25');
                    if (!this.hasCapability('measure_co2')) await this.addCapability('measure_co2');
                    if (!this.hasCapability('measure_humidity')) await this.addCapability('measure_humidity');
                    if (!this.hasCapability('measure_temperature')) await this.addCapability('measure_temperature');
                    if (!this.hasCapability('measure_tvoc')) await this.addCapability('measure_tvoc');

                    if (result_b1.result.pm25 !== undefined && result_b1.result.pm25 !== 99999) await this.updateCapabilityValue('measure_pm25', parseInt(result_b1.result.pm25));
                    if (result_b1.result.co2e !== undefined) await this.updateCapabilityValue('measure_co2', parseInt(result_b1.result.co2e));
                    if (result_b1.result.humidity !== undefined) await this.updateCapabilityValue('measure_humidity', parseInt(result_b1.result.humidity));
                    if (result_b1.result.temperature !== undefined) await this.updateCapabilityValue('measure_temperature', parseFloat(result_b1.result.temperature));
                    if (result_b1.result.tvoc !== undefined) await this.updateCapabilityValue('measure_tvoc', parseInt(result_b1.result.tvoc));
                    break;
                case 'cgllc.airmonitor.s1':
                    const result_s1 = await this.miio.call('get_value', ['co2', 'humidity', 'pm25', 'temperature', 'tvoc'], { retries: 1 });
                    // temporary debug
                    this.log('Retrieved data for cgllc.airmonitor.s1:', result_s1);
                    if (!this.getAvailable()) {
                        await this.setAvailable();
                    }

                    // user reported missing capabilities when pairing the device
                    if (!this.hasCapability('measure_pm25')) await this.addCapability('measure_pm25');
                    if (!this.hasCapability('measure_co2')) await this.addCapability('measure_co2');
                    if (!this.hasCapability('measure_humidity')) await this.addCapability('measure_humidity');
                    if (!this.hasCapability('measure_temperature')) await this.addCapability('measure_temperature');
                    if (!this.hasCapability('measure_tvoc')) await this.addCapability('measure_tvoc');

                    if (result_s1[0] !== undefined) await this.updateCapabilityValue('measure_co2', result_s1[0]);
                    if (result_s1[1] !== undefined) await this.updateCapabilityValue('measure_humidity', result_s1[1]);
                    // saw in the logs reports of PM25 being 99999, so added a check for that
                    if (result_s1[2] !== undefined && result_s1[2] !== 99999) await this.updateCapabilityValue("measure_pm25", parseFloat(result_s1[2]));
                    if (result_s1[3] !== undefined) await this.updateCapabilityValue('measure_temperature', parseFloat(result_s1[3]));
                    if (result_s1[4] !== undefined) await this.updateCapabilityValue('measure_tvoc', parseInt(result_s1[4]));
                    break;
                default:
                    break;
            }
        } catch (error) {
            this.homey.clearInterval(this.pollingInterval);
            if (this.getAvailable()) {
                this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch((error) => {
                    this.error(error);
                });
            }
            this.homey.setTimeout(() => {
                this.createDevice();
            }, 60000);
            this.error(error.message);
        }
    }
}

module.exports = AirmonitorZhimiCgllcDevice;
