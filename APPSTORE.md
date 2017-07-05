# Control Xiaomi Mi Home Wi-Fi devices
Use Homey to control Xiaomi Mi Home devices (the Mi Home Ecosystem is also branded as MiJia). Currently Xiaomi does not officialy support controlling most of it's devices from outside the Mi Home app with the exception of Yeelights. Yeelights can be added to Homey quite easy but for all other devices additional steps are needed that require technical skills setting up. These steps are described below but Xiaomi can make changes to it's eco system at any time resulting in devices that can not be added or controlled by Homey anymore.

This app uses an unofficial library called the [miIO Device Library](https://github.com/aholstenson/miio) for communication with those devices whoch lack official support for controlling externally, credits go out to the author of this library. This Homey app also only adds support for the devices that can be controlled directly through Wi-Fi, there is a whole range of Mi Home sensors that can only be used together with the Xiaomi Smart Home Gateway (which uses ZigBee) but this is currently out the scope of this app.

## Supported devices
Below is a list of  supported devices and devices that might be supported in the future if there is demand for this. Post a comment in the app store if you would like to see support for a specific device.
* Yeelight Bulbs Wi-Fi (tested)
* Robot Vacuum Cleaner (tested)
* Air Purifiers 2 and Pro (tested)
* Humidifier (untested)
* NOT SUPPORTED: Yeelight Desk Lamp, Yeelight LED Strip, Yeelight Ceiling Lamp
* NOT SUPPORTED: Smart Socket Plug and Power Strips
* NOT SUPPORTED: Lunar Smart Sleep Sensor
* NOT SUPPORTED: Air Quality Monitor (PM2.5)

## Adding Yeelights
This Homey app supports direct control for Yeelights. Before being able to add your Yeelights as devices in Homey you will need to enable the "Developer Mode". You can do this by using the official Yeelight app on your smartphone (not the Xiaomi Mi Home app but the actual Yeelight app). In this app go into the settings of your bulb and you will see a menu item called Developer Mode. This contains a toggle to enable the developer mode. After enabling this the Homey app will be able to autodiscover your bulb when adding it as new device.

## Adding miIO devices (Robot Vacuum Cleaner, Air Purifier and Humidifier)
For Homey to be able to communicate with devices over the miIO protocol a unique device token needs to be obtained. Some technical skills are needed for retrieving these tokens. If your are not to tech-savvy using this app for any other device than the Yeelights might be challenging. That being said, below are several methods for obtaining the token. Choose the method for your device.

* [Mi Robot Vacuum Cleaner with firmware lower as 3.3.9_003077, the Air Purifier and the Humidifier](https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token.md).
* [Mi Robot Vacuum Cleaner with firmware same or higher as 3.3.9_003077](https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token_mirobot_new.md).

## Supported Cards
### Yeelight Bulbs Wi-Fi
* Default flow cards for light capabilities class

### Mi Robot Vacuum Cleaner
* [CONDITIONS] Cleaning, Charging, Paused, Returning to dock
* [ACTIONS] Start, Pause, Stop, Return to dock, spotClean, Find, Set Fan Power

### Mi Air Purifiers
* [CONDITIONS] Powered
* [ACTIONS] Power on/off, Set speed

### Mi Humidifiers
* [CONDITIONS] Powered
* [ACTIONS] Power on/off, Set speed

## Donate
Donating is completely optional.
[![Donate](https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_donate_92x26.png)](https://paypal.me/jghaanstra)

## Changelog
### 2017-06-27 -- v2.1.0
This update requires you to re-pair the Yeelights, Air Purifier and Humidifier.
* NEW: changed from miio protocol to direct API for Yeelights, now using auto discovery and hue and saturation are working
* IMPROVEMENT: better field validation for tokens in pairing wizard for miIO devices
* IMPROVEMENT: use polling mechanism to get the capabilities for Air Purifier and Humidifier
* FIX: fixed issue with setting fanspeed for purifier and humidifier

### 2017-06-01 -- v2.0.0 beta
* NEW: rebuild from version 1.0.0 of the [Xiaomi Vacuum Cleaner app](https://github.com/jghaanstra/com.robot.xiaomi-mi)
* NEW: use the miIO device library
