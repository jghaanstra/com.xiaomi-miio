color-temperature
=================

![Color Spectrum](http://neilbartlett.github.io/color-temperature/images/color-temperature-spectrum.png)

Converts color temperature in Kelvin to a color in RGB color space -- and vice versa.

The conversion is designed to be fast and usable for image processing. More details on color temperature and the algorithm can be found [here](http://www.zombieprototypes.com/?p=210).

## Installation

`$ npm install --save color-temperture`

## Usage

```js
var ct = require('color-temperature');

//convert kelvin to RGB
// eg convert typical candlelight (1850K ) to RGB
var rgb = ct.colorTemperature2rgb(1850);

var red = rgb.red;
var green = rgb.green;
var blue = rgb.blue;
```

RGB color is represented in JSON format: An RGB of [0, 128, 255] would be represented as

```js
{
  red : 0,
  green : 128,
  blue : 255
}
```
## Examples


Often, the convertor is deployed as part of an image processing loop. The following example uses streams to generate a PNG similar to that at the top of this README file.

```js
var fs = require('fs');
var png_encoder = require('png-stream');
var ct = require('color-temperature');
var width = 500;
var height = 100;
var kelvinStart = 10;
var kelvinEnd = 40000;

var pixels = new Buffer(width * height * 3);
for (var w = 0; w < width; w += 1) {
  for (var h = 0; h < height; h += 1) {
      var i = ((h*width)+w)*3;

      kelvin = ((kelvinEnd-kelvinStart)/width)* w + kelvinStart;
      var rgb = ct.colorTemperature2rgb(kelvin);

      pixels[i] = rgb.red;
      pixels[i + 1] = rgb.green;
      pixels[i + 2] = rgb.blue;
  }
}

var enc = new png_encoder.Encoder(width, height);
enc.pipe(fs.createWriteStream('color-temperature-'+kelvinStart+'-'+kelvinEnd+'.png'));
enc.end(pixels);
```
There are examples in the examples directory.


## API


NOTE The conversions use approximations and are suitable for photo-mainpulation and other non-critical uses.

Accuracy is best between 1000K and 40000K.


```js
require('color-temperature').colorTemperature2rgb(kelvin);
```
Convert a color temperature in Kelvin to RGB.
This method uses an approximation based on a curve fit of data from a sparse RGB to
Kelvin mapping.

```js
require('color-temperature').colorTemperature2rgbUsingTH(kelvin);
```
A JavaScript port of the original algorithm from Tanner Helland. This method
is mainly here for comparison purposes. Generally, colorTemperature2rgb provides more
accurate results.

```js
require('color-temperature').rgb2colorTemperature(rgb);
```

Convert a color in RGB format to a color temperature in Kelvin.


## License

The code is released under an MIT license.

## Release History

* 0.1.0 Initial release

[![NPM](https://nodei.co/npm/color-temperature.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/color-temperature/)
