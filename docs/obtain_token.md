# Obtain Mi Home device token
Use these methods to obtain the device token for the Mi Robot Vacuum Cleaner with firmware lower as 3.3.9_003077, the Air Purifier and the Humidifier. If your Mi Vacuum Robot Cleaner is on firmware 3.3.9_003077 or higher you will need to follow the steps as described [here](https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token_mirobot_new.md).

## Method 1 - Nodejs Command Line Tool from the miIO Device library
The author of the miIO Device Library which is used by this Homey app has also created a nodejs command line tool for retrieving device tokens. Please follow the steps in [these instructions](https://github.com/aholstenson/miio/blob/master/docs/management.md) to retrieve the token for the Air Purifier or Humidifier. Be aware that the Mi Robot Vacuum Cleaner hides it's token when it has been setup. Retrieving tokens from the Mi Robot Vacuum Cleaner require a reset of the device as described [here](https://github.com/aholstenson/miio/blob/master/docs/management.md#getting-the-token-of-a-device).

## Method 2 - Packet Sender Tool
During setup of Mi Home devices the device tokens an be retrieved by sending a ping command to the device. This method uses a tool called Packet Sender which you will need to download. Choose the portable version which does not require installation.
* Download the portable version of [Packet Sender](https://packetsender.com/download).
* Reset the device following the instructions from the device manual, this usually means holding one or two buttons for 10 seconds. This will reset all device settings including the Wi-Fi settings.
* After reset the device will create a it's own Wi-Fi network. This network will have a name related to the device and is used for configuring the device but will also allow us to retrieve the token. Connect to this Wi-Fi network with your computer which has Packet Sender running.
* Open Packet Sender and enter the following details.
    * HEX: 21310020ffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    * IP: 192.168.8.1
    * Port: 54321
    * Protocol dropdown: UDP
* Click send and the device will respond with an answer which contains the unique device token. In the last 16 bytes (32 characters) of the devices response is the device token. Copy and save it somewhere.
* Disconnect your computer from the devices network, you can now use the Mi Home app to setup the device and connect it to your Wi-Fi network.
