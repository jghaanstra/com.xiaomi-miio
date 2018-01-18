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

exports.getPhilipsBulb = function (address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {

            var onoff = device.power;
            var brightness = device.brightness;
            var colorTemperature = device.colorTemperature;

            result = {
                onoff: onoff,
                brightness: brightness,
                colorTemperature: colorTemperature
            }

            return resolve(result);
        }).catch(function (error) {
            return reject(error);
        });
    })
}

exports.getPhilipsEyecare = function (address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {

            var onoff = device.power;
            var brightness = device.brightness;
            var mode = device.eyeCareMode;

            result = {
                onoff: onoff,
                brightness: brightness,
                mode: mode
            }

            return resolve(result);
        }).catch(function (error) {
            return reject(error);
        });
    })
}

exports.getPowerPlug = function (address, token) {
    return new Promise(function (resolve, reject) {
        miio.device({
            address: address,
            token: token
        }).then(device => {

            var onoff = device.power(0);
            var load = device.loadPower;
            var consumed = device.powerConsumed;

            result = {
                onoff: onoff,
                load: load,
                consumed: consumed
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
                        case 'favorite':
                            device.setMode('favorite')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'study':
                            device.setEyecareMode('study')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'reading':
                            device.setEyecareMode('reading')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        case 'phone':
                            device.setEyecareMode('phone')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                            break;
                        default:
                            device.setMode('auto')
                                .then(result => { return resolve(true) })
                                .then(error => { return reject(error) });
                    }
                    break;
                case 'setfavorite':
                    device.setFavoriteLevel(value)
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                /* LIGHTS */
                case 'dim':
                    device.setBrightness(value)
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'colortemperature':
                    device.colorTemperature(value)
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
                    break;
                case 'eyecare':
                    device.setEyeCare(value)
                        .then(result => { return resolve(true) })
                        .then(error => { return reject(error) });
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

exports.normalize = function (value, min, max) {
	var normalized = (value - min) / (max - min);
	return Number(normalized.toFixed(2));
}

exports.denormalize = function (normalized, min, max) {
	var denormalized = ((1 - normalized) * (max - min) + min);
	return Number(denormalized.toFixed(0));
}
