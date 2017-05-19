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
            default:
                Homey.log("Not a valid command");
        }
        callback(null, "Command send succesfully");
    }).catch(function (err) {
        Homey.log('Cannot send command: ' + err);
        callback(err, null);
    });
}

exports.sendCommand = function (command, address, token, callback) {
    miio.device({
        address: address,
        token: token
    }).then(device => {
        switch(command) {
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
            case 'state':
                callback(null, device.state);
                break;
            case 'battery':
                callback(null, device.battery);
                break;
            case 'fanPower':
                switch(args.fanspeed) {
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
            case 'mode':
                switch(args.mode) {
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
            case 'powered':
                if(device.power){
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            case 'turnon':
                device.setPower(true);
                break;
            case 'turnoff':
                device.setPower(false);
                break;
            default:
                Homey.log("Not a valid command");
        }
        callback(null, "Command send succesfully");
    }).catch(function (err) {
        callback(err, null);
    });
}
