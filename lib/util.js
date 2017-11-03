const miio = require('miio');

exports.getAirPurifier = function (address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {

            var onoff = device.power;
            var mode = device.mode;
            var temperature = device.temperature;
            var humidity = device.humidity;
            var aqi = device.aqi;

            result = {
                onoff: onoff,
                mode: mode,
                temperature: temperature,
                humidity: humidity,
                aqi: aqi
            }

            return resolve(result);
        }).catch(function (error) {
            return reject(error);
        });
    })
}

exports.getHumidifier = function (address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {

            var onoff = device.power;
            var mode = device.mode;
            var temperature = device.temperature;
            var humidity = device.humidity;

            result = {
                onoff: onoff,
                mode: mode,
                temperature: temperature,
                humidity: humidity
            }

            return resolve(result);
        }).catch(function (error) {
            return reject(error);
        });
    })
}

// TODO: maintain support for Vacuum Cleaner?
exports.getVacuumCleaner = function (address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {

            var onoff = device.power;
            var state = device.state;
            var battery = device.battery;

            result = {
                onoff: onoff,
                state: state,
                battery: battery
            }

            return resolve(result);
        }).catch(function (error) {
            return reject(error);
        });
    })
}

exports.sendCommand = function (command, value, address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {
            switch(command) {
                /* POWER SETTINGS */
                case 'powered':
                    if(device.power){
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                    break;
                case 'turnon':
                    device.setPower(true)
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'turnoff':
                    device.setPower(false)
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'toggle':
                    if (device.power) {
                        device.setPower(false)
                            .then(result => { return resolve(true) })
                            .then(error => { return reject(error) });
                    } else {
                        device.setPower(true)
                            .then(result => { return resolve(true) })
                            .then(error => { return reject(error) });
                    }
                    break;
                /* STATUS */
                case 'state':
                    var device_state = device.state;
                    if(device_state == value) {
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                    break;
                case 'mode':
                    switch(value) {
                        case 'idle':
                            device.setMode('idle')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'auto':
                            device.setMode('auto')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'silent':
                            device.setMode('silent')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'low':
                            device.setMode('low')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'medium':
                            device.setMode('medium')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'high':
                            device.setMode('high')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        default:
                            device.setMode('auto')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                    }
                    break;
                /* MI ROBOT */
                // TODO: maintain support for Vacuum Cleaner?
                case 'start':
                    device.start()
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'pause':
                    device.pause()
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'stop':
                    device.stop()
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'charge':
                    device.charge()
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'spotclean':
                    device.spotClean()
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'find':
                    device.find()
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'fanPower':
                    switch(value) {
                        case 'quiet':
                            device.setFanPower(38)
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'balanced':
                            device.setFanPower(60)
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'turbo':
                            device.setFanPower(77)
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'full':
                            device.setFanPower(90)
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        default:
                            device.setFanPower(60)
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                    }
                    break;
                default:
                    this.log("Not a valid command");
                    return reject("Not a valid command");

            }
        }).catch(function (error) {
            return reject(error);
        })
    })
}
