# Obtain Mi Home device token
Use these methods to obtain the device token for the Mi Robot Vacuum Cleaner with firmware 3.3.9_003077 or higher.

## Android users
### Rooted Android Phones
* Setup your Android device with the Mi Home app
* Install [aSQLiteManager](https://play.google.com/store/apps/details?id=dk.andsen.asqlitemanager) on your phone
* Use a file browser with granted root privilege and browse to /data/data/com.xiaomi.smarthome/databases/
* Copy miio2.db to an accessable location
* Open your copy of miio2.db with aSQLiteManager and execute the query "select token from devicerecord where localIP is '192.168.0.1'" where you replace the IP address with the IP address of the device you want to get the token from. It will show you the current device token.

### Non-Rooted Android Phones
* Setup your Android device with the Mi Home app
* Enable developer mode and USB debugging on your phone and connect it to your computer
* Get the ADB tool for Windows: https://developer.android.com/studio/releases/platform-tools.html
* Create a backup of the Mi Home app: .\adb backup -noapk com.xiaomi.smarthome -f backup.ab
* On your phone you must confirm the backup. Do not enter any password and press button to make the backup
* Get ADB Backup Extractor and install it: https://sourceforge.net/projects/adbextractor/
* Extract all files from the backup on your computer: java.exe -jar ../android-backup-extractor/abe.jar unpack backup.ab backup.tar
* Unzip the ".tar" file
* Open /com.xiaomi.smarthome/database/miio2.db with a SQLite browser (for instance http://sqlitebrowser.org/)
* Execute the query "select token from devicerecord where localIP is '192.168.0.1'" where you replace the IP address with the IP address of the device you want to get the token from. It will show you the current device token.

## iOS users
* Setup your iOS device with the Mi Home app
* Create an unencrypted backup of the device on your computer using iTunes
* Install iBackup Viewer from [here](http://www.imactools.com/iphonebackupviewer/).
* Extracted this file "/raw data/com.xiaomi.mihome/_mihome.sqlite" to your computer
* Open the file extracted using notepad. You will then see the list of all the device in your account with their token
