var fs = require('fs');
var png_encoder = require('png-stream');
var ct = require('../color-temperature.js');
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
