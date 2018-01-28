/**
*  color-temperature.js
*
*  Neil Bartlett
*  neilbartlett.com
*  2015-01-22
*
*  Copyright [2015] [Neil Bartlett] *
*
* Color Temperature is the color due to black body radiation at a given
* temperature. The temperature is given in Kelvin. The concept is widely used
* in photography and in tools such as f.lux.
*
* The function here converts a given color temperature into a near equivalent
* in the RGB colorspace. The function is based on a curve fit on standard sparse
* set of Kelvin to RGB mappings.
*
* Two conversions are presented here. The one colorTempertature2RGBUSingTH
* is a JS version of the algorithm developed by Tanner Helland. The second is a
* slightly more accurate conversion based on a refitting of the original data
* using different curve fit functions. The performance cost of the two
* approaches is very similar and in general the second algorithm is preferred.
*
* NOTE The approximations used are suitable for photo-mainpulation and other
* non-critical uses. They are not suitable for medical or other high accuracy
* use cases.
*
* Accuracy is best between 1000K and 40000K.
*
* See http://github.com/neilbartlett/color-temperature for further details.
*
**/


/**
 * A JS verion of Tanner Helland's original algorithm.
 * Input: color temperature in degrees Kelvin
 * Output: json object of red, green and blue components of the Kelvin temperature
 */
 module.exports.colorTemperature2rgbUsingTH = colorTemperature2rgbUsingTH = function(kelvin) {

  var temperature = kelvin / 100.0;
  var red, green, blue;

  if (temperature <= 66.0) {
    red = 255;
  } else {
    red = temperature - 60.0;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    if (red < 0) red = 0;
    if (red > 255) red = 255;
  }

  /* Calculate green */

  if (temperature <= 66.0) {
    green = temperature;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  } else {
    green = temperature - 60.0;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  }

  /* Calculate blue */

  if (temperature >= 66.0) {
    blue = 255;
  } else {

    if (temperature <= 19.0) {
      blue = 0;
    } else {
      blue = temperature - 10;
      blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
      if (blue < 0) blue = 0;
      if (blue > 255) blue = 255;
    }
  }

  return {red: Math.round(red), blue: Math.round(blue), green: Math.round(green)};
}

/**
 * A more accurate version algorithm based on a different curve fit to the
 * original RGB to Kelvin data.
  * Input: color temperature in degrees Kelvin
  * Output: json object of red, green and blue components of the Kelvin temperature
 */
 module.exports.colorTemperature2rgb = colorTemperature2rgb = function(kelvin) {

  var temperature = kelvin / 100.0;
  var red, green, blue;

  if (temperature < 66.0) {
    red = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 351.97690566805693`,
    // b -> 0.114206453784165`,
    // c -> -40.25366309332127
    //x -> (kelvin/100) - 55}
    red = temperature - 55.0;
    red = 351.97690566805693+ 0.114206453784165 * red - 40.25366309332127 * Math.log(red);
    if (red < 0) red = 0;
    if (red > 255) red = 255;
  }

  /* Calculate green */

  if (temperature < 66.0) {

    // a + b x + c Log[x] /.
    // {a -> -155.25485562709179`,
    // b -> -0.44596950469579133`,
    // c -> 104.49216199393888`,
    // x -> (kelvin/100) - 2}
    green = temperature - 2;
    green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;

  } else {

    // a + b x + c Log[x] /.
    // {a -> 325.4494125711974`,
    // b -> 0.07943456536662342`,
    // c -> -28.0852963507957`,
    // x -> (kelvin/100) - 50}
    green = temperature - 50.0;
    green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;

  }

  /* Calculate blue */

  if (temperature >= 66.0) {
    blue = 255;
  } else {

    if (temperature <= 20.0) {
      blue = 0;
    } else {

      // a + b x + c Log[x] /.
      // {a -> -254.76935184120902`,
      // b -> 0.8274096064007395`,
      // c -> 115.67994401066147`,
      // x -> kelvin/100 - 10}
      blue = temperature - 10;
      blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
      if (blue < 0) blue = 0;
      if (blue > 255) blue = 255;
    }
  }

  return {red: Math.round(red), blue: Math.round(blue), green: Math.round(green)};
}

/**
 convert an rgb in JSON format into to a Kelvin color temperature
 */
module.exports.rgb2colorTemperature = rgb2colorTemperature = function(rgb) {
  var temperature, testRGB;
  var epsilon=0.4;
  var minTemperature = 1000;
  var maxTemperature = 40000;
  while (maxTemperature - minTemperature > epsilon) {
    temperature = (maxTemperature + minTemperature) / 2;
    testRGB = colorTemperature2rgb(temperature);
    if ((testRGB.blue / testRGB.red) >= (rgb.blue / rgb.red)) {
      maxTemperature = temperature;
    } else {
      minTemperature = temperature;
    }
  }
  return Math.round(temperature);
};
