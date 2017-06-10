const miio = require('miio');

exports.testConnection = function (command, data, callback) {
    miio.device({
        address: data.address,
        token: data.token
    }).then(device => {
        switch(command) {
            case 'find':
                device.find();
                break;
            case 'buzzer':
                device.setBuzzer(true)
                break;
            case 'toggle':
                if(device.power){
                    device.setPower(false);
                } else {
                    device.setPower(true);
                }
                break;
            default:
                Homey.log("Not a valid command");
        }
        callback(null, "Command send succesfully");
    }).catch(function (err) {
        Homey.log('Cannot send command: ' + err);
        callback(err, null);
    });
}

exports.sendCommand = function (command, value, address, token, callback) {
    miio.device({
        address: address,
        token: token
    }).then(device => {
        switch(command) {
            /* POWER SETTINGS */
            case 'powered':
                if(device.power){
                    callback(null, true);
                } else {
                    callback(null, false);
                }
                break;
            case 'turnon':
                device.setPower(true);
                break;
            case 'turnoff':
                device.setPower(false);
                break;
            case 'toggle':
                if(device.power){
                    device.setPower(false);
                } else {
                    device.setPower(true);
                }
                break;
            /* STATUS */
            case 'state':
                callback(null, device.state);
                break;
            case 'mode':
                switch(value) {
                    case 'idle':
                        device.setMode('idle');
                        break;
                    case 'auto':
                        device.setMode('auto');
                        break;
                    case 'silent':
                        device.setMode('silent');
                        break;
                    case 'low':
                        device.setMode('low');
                        break;
                    case 'medium':
                        device.setMode('medium');
                        break;
                    case 'high':
                        device.setMode('high');
                        break;
                    default:
                        device.setMode('auto');
                }
                break;
            /* YEELIGHTS */
            case 'brightness':
                var brightness = device.brightness * 100;
                callback(null, brightness);
                break;
            case 'setbrightness':
                if(value == 0) {
                    var brightness = 1;
                } else {
                    var brightness = value * 100;
                }
                device.setBrightness(brightness);
                break;
            case 'hue':
                callback(null, device.rgb);
                break;
            case 'sethue':
                device.setRGB(value);
                break;
            case 'saturation':
                callback(null, device.rgb);
                break;
            case 'setsaturation':
                device.setRGB(value);
                break;
            case 'colortemperature':
                colortemp = normalize(device.colorTemperature, 1700, 6500);
                callback(null, colortemp);
                break;
            case 'setcolortemperature':
                colortemp = denormalize(value, 1700, 6500);
                device.setColorTemperature(colortemp);
                break;
            case 'colormode':
                callback(null, device.colorMode);
                break;
            /* MI ROBOT */
            case 'start':
                device.start();
                break;
            case 'pause':
                device.pause();
                break;
            case 'stop':
                device.stop();
                break;
            case 'charge':
                device.charge();
                break;
            case 'spotclean':
                device.spotClean();
                break;
            case 'find':
                device.find();
                break;
            case 'battery':
                callback(null, device.battery);
                break;
            case 'fanPower':
                switch(value) {
                    case 'quiet':
                        device.setFanPower(38);
                        break;
                    case 'balanced':
                        device.setFanPower(60);
                        break;
                    case 'turbo':
                        device.setFanPower(77);
                        break;
                    case 'full':
                        device.setFanPower(90);
                        break;
                    default:
                        device.setFanPower(60);
                }
                break;
            /* AIR PURIFIER & HUMIDIFIER */
            case 'temperature':
                console.log("Device temp: "+ device.temperature);
                callback(null, device.temperature);
                break;
            case 'humidity':
            console.log("Device humidity: "+ device.humidity);
                callback(null, device.humidity);
                break;
            case 'aqi':
                console.log("Device aqi: "+ device.aqi);
                callback(null, device.aqi);
                break;
            default:
                Homey.log("Not a valid command");
        }
        callback(null, "Command send succesfully");
    }).catch(function (err) {
        callback(err, null);
    });
}

function normalize(value, min, max) {
	var normalized = (value - min) / (max - min);
	return normalized;
}

function denormalize(normalized, min, max) {
	var denormalized = (normalized * (max - min) + min);
	return denormalized;
}
