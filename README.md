# Control Xiaomi Mi Home devices with the miIO protocol
Use [Homey](https://www.athom.com/) to control Xiaomi Mi Home devices that use the miIO protocol. Currently Xiaomi does not offer an open API for controlling these devices. This app uses an unofficial library called the [miIO Device Library](https://github.com/aholstenson/miio) for communication with these devices, credits go out to the author of this library.

## Disclaimer
For Homey to be able to communicate with these devices a unique device token needs to be obtained. Most of the miIO devices hide their token and some technical skills are needed for retrieving these tokens. If your are not to tech-savvy this app might not be for you. That being said, this README tries to explain various ways on how to obtain your token.

## Supported devices
Below is a list of currently supported devices and devices that might be supported in the future.
* SUPPORTED: Mi Robot Vacuum Cleaner
* NOT SUPPORTED YET: Air Purifiers (1, 2 and Pro)
* NOT SUPPORTED YET: Mi Humidifier
* NOT SUPPORTED YET: Mi Smart Socket Plug and Power Strips
* NOT SUPPORTED YET: Mi Smart Home Gateway (Aqara) and accessories
* NOT SUPPORTED YET: Yeelights

## Obtaining tokens
Placeholder for instructions on how to obtain tokens

## Supported Cards

### Mi Robot Vacuum Cleaner
* [CONDITIONS] Cleaning, Charging, Paused, Returning to dock
* [ACTIONS] Start, Pause, Stop, Return to dock, spotClean, Find

## Changelog
### 2017-05-16 -- v2.0.0
* rebuild from version 1.0.0 of the [Xiaomi Vacuum Cleaner app](https://github.com/jghaanstra/com.robot.xiaomi-mi)
* use the miIO device library
* TODO: added other devices
* TODO: finish documentation
* TODO: replace app store images with Mi Home images
