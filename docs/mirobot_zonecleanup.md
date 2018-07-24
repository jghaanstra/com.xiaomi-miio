# Using the "Go To Target" and "Zone Cleanup" action cards for the Mi Robot.
Below are instructions on how to use the zoned cleaning and goto action cards for the Xiaomi Mi Robot. Credits for this tutorial go out to user ciB on the Home Assistant forum.

## Firmware
This functionality has recently become available for the v1 version of the Xiaomi Mi Robot. Make sure you update your Mi Robot to the latest available firmware using the Mi Home smartphone app. Disclaimer: in some cases this might result in the token being reset which requires you to find your token again.

## Figuring out coordinates on the map
Unfortunately there is no easy way without rooting the device to directly access the map with its coordinates, so you have to do some manual labor. The way the map is created works like this: the starting point of the map (which should be right in front of the dockings station - where your robot starts off at) is somewhere around [25500,25500] and the map is then build around this coordinates.
All you have to do is figure out a grid and then read off the coordinates that you need:
* Step 1: Make sure your docking station is at a fixed position (so your starting point will ALWAYS be the same).
* Step 2: If not yet created, let your robot create a full map of your apartment/flat by starting the cleaning from the Mi Home App.
* Step 3: Use the "go to target" action card to send the robot to places while you have the Mi Home app open. It will then show you where you have send the robot. Increasing the x coordinate will move the robot relative to the starting point to the right (decreasing to the left), increasing the y coordinate will move the robot relative to the starting point to the top (decreasing to the bottom). With some trial and error you will be able to find the right coordinates for places you want to go and for the zones you want to clean.
![Home Location](homezone.png?raw=true)

## Using the "Go To Target" action card
This card requires you to enter the x and y coordinate of a location where you want to go. If you have not figured out the right coordinates yet you should use the Mi Home smartphone app where you can see where your Mi Robot is actually going to go after sending in some coordinates.

## Using the "Zone Cleanup" action card
This action card requires you to enter one or multiple zones for cleaning. A zone takes two coordinates, the first one is the bottom left corner, the other one the top right corner and at the end you can specify the number of times the zone needs to be cleaned. So a single zone would look something like this: [25200, 27500, 27250, 30250, 1]. You can specify multiple zones by seperating them by a comma. So a zone cleanup with two zones would look like this: [25200, 27500, 27250, 30250, 1], [27000, 22250, 28200, 27000, 1].

That's it. Enjoy zone cleaning.
