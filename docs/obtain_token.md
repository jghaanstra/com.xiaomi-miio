# Obtain Mi Home device token
Use these methods to obtain the device token for the supported miio devices.

## Method 1 - Nodejs Command Line Tool from the miIO Device library
The author of the miIO Device Library which is used by this Homey app has also created a nodejs command line tool for retrieving device tokens. Please follow the steps in [these instructions](https://github.com/aholstenson/miio/blob/master/docs/management.md) to retrieve the token for the supported miio devices. Be aware that some devices hide their token after the device has been setup in the Mi Home app. Retrieving tokens for these devices will not work with this method but require method 3.

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

## Method 2b - netcat and Wireshark / tcpdump
Like above you can also use this shell command to send the magic package:

```sh
echo -ne '\x21\x31\x00\x20\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff' | nc -u 192.168.8.1 54321
```

While running this you have to listen with Wireshark or tcpdump for UDP packages sent as anser by the robot.
Extract the last 16 bytes of the answer and convert them to a (32 characters) hexadecimal string using `xxd -p`.

## Method 3 - Obtain Xiaomi Gateway device token
This method is specifically for the Xiaomi Gateway.

* Open Mi Home App in your Android device.
* Select your xiaomi device.
* Then click on the 3 dots at the top right of the screen.
* Then click on "About".
* Tap on the version number at the bottom of the screen repeatedly.
* You should see now 2 extra options listed.
* Tap on the second option: "Hub info".
* There you can find the device token.

## Method 4 - Obtain Mi Home device token for devices that hide their tokens after setup
Use these methods to obtain the device token for devices that hide their tokens after setup in the Mi Home App (like the Mi Robot Vacuum Cleaner with firmware 3.3.9_003077 or higher). The latest versions of the Mi Home smartphone app dont hold the token anymore so before you begin with any of these methods you will need to install an older version of the smartphone app. Version 5.0.19 works for sure with the 1st gen Vacuum Robot, for the 2nd gen (S50) you should try version 3.3.9_5.0.30. Android users can find older version of the app [here](https://www.apkmirror.com/apk/xiaomi-inc/mihome/).

### Android users
#### Rooted Android Phones
* Setup your Android device with the Mi Home app
* Install [aSQLiteManager](https://play.google.com/store/apps/details?id=dk.andsen.asqlitemanager) on your phone
* Use a file browser with granted root privilege and browse to /data/data/com.xiaomi.smarthome/databases/
* Copy miio2.db to an accessable location
* Open your copy of miio2.db with aSQLiteManager and execute the query "select token from devicerecord where localIP is '192.168.0.1'" where you replace the IP address with the IP address of the device you want to get the token from. It will show you the 32 character device token for your Mi Home device.

#### Non-Rooted Android Phones
* Setup your Android device with the Mi Home app
* Enable developer mode and USB debugging on your phone and connect it to your computer
* Get the ADB tool
   - for Windows: https://developer.android.com/studio/releases/platform-tools.html
   - for Mac: `brew install adb`
* Create a backup of the Mi Home app:
   - for Windows: `.\adb backup -noapk com.xiaomi.smarthome -f mi-home-backup.ab`
   - for Mac: `adb backup -noapk com.xiaomi.smarthome -f mi-home-backup.ab`
* On your phone you must confirm the backup. Do not enter any password and press button to make the backup
* (Windows Only) Get ADB Backup Extractor and install it: https://sourceforge.net/projects/adbextractor/
* Extract all files from the backup on your computer:
   - for Windows: `java.exe -jar ../android-backup-extractor/abe.jar unpack mi-home-backup.ab backup.tar`
   - for Mac & Unix: `( printf "\x1f\x8b\x08\x00\x00\x00\x00\x00" ; tail -c +25 mi-home-backup.ab) |  tar xfvz -`
* Unzip the ".tar" file
* Open /com.xiaomi.smarthome/db/miio2.db with a SQLite browser (for instance http://sqlitebrowser.org/)
* Execute the query "select token from devicerecord where localIP is '192.168.0.1'" where you replace the IP address with the IP address of the Mi Home device you want to get the token from. It will show you the 32 character device token for your Mi Home device.

### iOS users
### Non-Jailbroken iOS users
* Setup your iOS device with the Mi Home app
* Create an unencrypted backup of your iOS device on your computer using iTunes. In case you are unable to disable encryption you probably have a profile preventing this that enforces certain security policies (like work related accounts). Delete these profiles or use another iOS device to continu.
* Install iBackup Viewer from [here](http://www.imactools.com/iphonebackupviewer/).
* Navigate to your BACKUPS and find the name of your iOS device in the list. Open this backup by clicking the triangle in front of it and then click on raw data.
* Sort the view by name and find the folder com.xiaomi.mihome and highlight it (it's somewhere at the end). After highlighting it click on the cockwheel above the results and select "Save selected files" from here and choose a location to save the files.
* Navigate to the com.xiaomi.mihome folder which you just saved somewhere and inside this folder navigate to the /Documents/ subfolder. In this folder there is a file named <userid>_mihome.sqlite where your userid is specific for your account.
* Open this file with a SQLite browser (for instance http://sqlitebrowser.org/)
* Execute the query "select ZTOKEN from ZDEVICE where ZLOCALIP is '192.168.0.1'" where you replace the IP address with the IP address of the Mi Home device you want to get the token from. It will show you the 32 character device token for your Mi Home device.
* The latest Mi Home app store the tokens encrypted into a 96 character key and require an extra step to decode this into the actual token. Visit [this](http://aes.online-domain-tools.com/) website and enter the details as shown below:
** __Input type:__ text
    * __Input text (hex):__ your 96 character key
    * __Selectbox Plaintext / Hex:__ Hex
    * __Function:__ AES
    * __Mode:__ ECB
    * __Key (hex):__ 00000000000000000000000000000000
    * __Selectbox Plaintext / Hex:__ Hex
* Hit the decrypt button. Your token are the first two lines of the right block of code. These two lines should contain a token of 32 characters and should be the correct token for your device.

## Jailbroken iOS users
* Setup your iOS device with the Mi Home app
* Use something like Forklift sFTP to connect to your iOS device and copy this file to your computer: /var/mobile/Containers/Data/Application/[UUID]/Documents/USERID_mihome.sqlite (where UUID is a specific number for your device)
    * username: root
    * IP address: your phones IP address
    * password: alpine (unless you changed it something else)
* Open this file with a SQLite browser (for instance http://sqlitebrowser.org/)
* Execute the query "select ZTOKEN from ZDEVICE where ZLOCALIP is '192.168.0.1'" where you replace the IP address with the IP address of the Mi Home device you want to get the token from. It will show you the 32 character device token for your Mi Home device.
* The latest Mi Home app store the tokens encrypted into a 96 character key and require an extra step to decode this into the actual token. Visit [this](http://aes.online-domain-tools.com/) website and enter the details as shown below:
    * __Input type:__ text
    * __Input text (hex):__ your 96 character key
    * __Selectbox Plaintext / Hex:__ Hex
    * __Function:__ AES
    * __Mode:__ ECB
    * __Key (hex):__ 00000000000000000000000000000000
    * __Selectbox Plaintext / Hex:__ Hex
* Hit the decrypt button. Your token are the first two lines of the right block of code. These two lines should contain a token of 32 characters and should be the correct token for your device.
