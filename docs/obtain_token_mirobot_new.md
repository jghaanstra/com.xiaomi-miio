# Obtain Mi Home device token
Use these methods to obtain the device token for the Mi Robot Vacuum Cleaner with firmware 3.3.9_003077 or higher.

## Android users
### Rooted Android Phones
* Setup your Android device with the Mi Home app
* Install [aSQLiteManager](https://play.google.com/store/apps/details?id=dk.andsen.asqlitemanager) on your phone
* Use a file browser with granted root privilege and browse to /data/data/com.xiaomi.smarthome/databases/
* Copy miio2.db to an accessable location
* Open your copy of miio2.db with aSQLiteManager and execute the query "select token from devicerecord where localIP is '192.168.0.1'" where you replace the IP address with the IP address of the device you want to get the token from. It will show you the 32 character device token for your Mi Home device.

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
* Execute the query "select token from devicerecord where localIP is '192.168.0.1'" where you replace the IP address with the IP address of the Mi Home device you want to get the token from. It will show you the 32 character device token for your Mi Home device.

## iOS users
## Non-Jailbroken iOS users
* Setup your iOS device with the Mi Home app
* Create an unencrypted backup of your iOS device on your computer using iTunes. In case you are unable to disable encryption you probably have a profile preventing this that enforces certain security policies (like work related accounts). Delete these profiles or use another iOS device to continu.
* Install iBackup Viewer from [here](http://www.imactools.com/iphonebackupviewer/).
* Navigate to your BACKUPS and find the name of your iOS device in the list. Open this backup by clicking the triangle in front of it and then click on raw data.
* Sort the view by name and find the folder com.xiaomi.mihome and highlight it (it's somewhere at the end). After highlighting it click on the cockwheel above the results and select "Save selected files" from here and choose a location to save the files.
* Navigate to the com.xiaomi.mihome folder which you just saved somewhere and inside this folder navigate to the /Documents/ subfolder. In this folder there is a file named <userid>_mihome.sqlite where your userid is specific for your account.
* Open this file with a SQLite browser (for instance http://sqlitebrowser.org/)
* Execute the query "select ZTOKEN from ZDEVICE where ZLOCALIP is '192.168.0.1'" where you replace the IP address with the IP address of the Mi Home device you want to get the token from. It will show you the 32 character device token for your Mi Home device.

## Jailbroken iOS users
* Setup your iOS device with the Mi Home app
* Use something like Forklift sFTP to connect to your iOS device and copy this file to your computer: /var/mobile/Containers/Data/Application/514106F3-C854-45E9-A45C-119CB4FFC235/Documents/USERID_mihome.sqlite
** username: root
** IP address: your phones IP address
** password: alpine (unless you changed it something else)
* Open this file with a SQLite browser (for instance http://sqlitebrowser.org/)
* Execute the query "select ZTOKEN from ZDEVICE where ZLOCALIP is '192.168.0.1'" where you replace the IP address with the IP address of the Mi Home device you want to get the token from. It will show you the 32 character device token for your Mi Home device.
