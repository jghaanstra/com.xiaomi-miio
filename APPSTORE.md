# Control Xiaomi Mi Home Wi-Fi devices
Use Homey to control Xiaomi Mi Home devices (the Mi Home Ecosystem is also branded as MiJia). Currently Xiaomi does not officialy support controlling most of it's devices from outside the Mi Home app with the exception of Yeelights. Yeelights can be added to Homey quite easy but for all other devices additional steps are needed that require technical skills setting up. These steps are described but Xiaomi can make changes to it's eco system at any time resulting in devices that can not be added or controlled by Homey anymore.

This app uses an unofficial library called the [miIO Device Library](https://github.com/aholstenson/miio) for communication with those devices which lack official support for controlling externally, credits go out to the author of this library. This Homey app also only adds support for the devices that can be controlled directly through Wi-Fi, there is a whole range of Mi Home sensors that can only be used together with the Xiaomi Smart Home Gateway (which uses ZigBee) but this is currently out the scope of this app.

## Supported devices
Below is a list of  supported devices and devices that might be supported in the future if there is demand for this. Post a comment in the app store if you would like to see support for a specific device.
* Yeelight Bulbs Wi-Fi (tested)
* Yeelight LED strips (tested)
* Yeelight Ceiling Light (untested)
* Yeelight Bedside Lamp II (untested)
* Air Purifiers 2 and Pro (tested)
* Humidifier (untested)
* NOT SUPPORTED ANYMORE: Robot Vacuum Cleaner (commands time out with latest firmware)
* NOT SUPPORTED: Yeelight Desk Lamp
* NOT SUPPORTED: Smart Socket Plug and Power Strips
* NOT SUPPORTED: Lunar Smart Sleep Sensor
* NOT SUPPORTED: Air Quality Monitor (PM2.5)

## Support topic
For support please use the official support topic on the forum [here](https://forum.athom.com/discussion/3295/).

## Adding Yeelights
This Homey app supports direct control for Yeelights. Before being able to add your Yeelights as devices in Homey you will need to enable the "Developer Mode". You can do this by using the official Yeelight app on your smartphone (not the Xiaomi Mi Home app but the actual Yeelight app). In this app go into the settings of your bulb and you will see a menu item called Developer Mode. This contains a toggle to enable the developer mode. After enabling this the Homey app will be able to autodiscover your bulb when adding it as new device.

## Adding miIO devices (Air Purifier and Humidifier)
For Homey to be able to communicate with devices over the miIO protocol a unique device token needs to be obtained. Some technical skills are needed for retrieving these tokens. If your are not to tech-savvy using this app for any other device than the Yeelights might be challenging. See the instructions below.

* [Air Purifier and Humidifier](https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token.md).

## Supported Cards
### Yeelight Bulbs Wi-Fi
* Default flow cards for light capabilities class
* [ACTIONS] Change brightness over time, Temperature/brightness scene, Color/brightness scene, Custom command (advanced), Set default on state

### Mi Air Purifiers
* [CONDITIONS] Powered
* [ACTIONS] Power on/off, Set speed

### Mi Humidifiers
* [CONDITIONS] Powered
* [ACTIONS] Power on/off, Set speed

## Changelog
### 2017-11-06 -- v2.3.1
* UPDATE: code rewrite for SDK2
* UPDATE: made use of official donation button feature of Homey app store
* REMOVED: driver for the Mi Robot Vacuum Cleaner since it's not working anymore with the latest firmware update of the cleaner (if you still want to use/try it you can do a local install from the [beta branch on GitHub](https://github.com/jghaanstra/com.xiaomi-miio/tree/beta) )
* NEW: changed Yeelight driver to support Yeelight LED strip (require repairing of **ALL** Yeelight devices)
* NEW: added extra action cards for Yeelights: Change brightness over time, Custom command (advanced), Set default on state, Temperature/brightness scene, Color/brightness scene
* NEW: added support for the default dim over time action card for Yeelights
* NEW: added support for Yeelight Bedside Lamp II (WiFi) and Yeelight Ceiling Light
* IMPROVEMENT: switched from custom capability for air quality to the new default pm2.5 capability for the Air Purifier (requires repairing of the air purifier)
