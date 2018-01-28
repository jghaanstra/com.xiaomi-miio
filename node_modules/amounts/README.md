# Amounts

Represent amounts of stuff with units and conversions. Supports lenient
parsing of amounts, normalization and basic formatting.

```javascript
const { length, duration } = require('amounts');

// Supports parsing from strings:
const value = length('30 m');
// Convert into another unit (returns a number)
console.log(length.as('ft'));
console.log(length.feet);

// Parse durations
console.log(duration('20 m, 4 s'));

// Supports precision on the numbers
length('2.8 cm')
length('2e10 m')
```

Amounts tries to be friendly with handling input, supporting variations of
units, such as both short and long names, with longer unit names being
case insensitive.

These will all parse to the same unit and value:

```javascript
mass('750 ug');
mass('750 micrograms');
mass('750 micro gram');
mass('750 MikroGram')
```

But this will not work:

```javascript
mass('750 uG');
```

Or fetch units from factories and use `convert`:

```javascript
// To convert to mmHg
pressure.unit('mmHg').convert('200.12 kPa');
// Or back to kPa
pressure.unit('kPa').convert(1501.023, 'mmHg');
```

## API

All amounts that can be represented share a common API. Factories support:

* `factory(string)`

    Parse the given string into an amount.

* `factory(value, unit)`

    Create an amount with the given value and unit.

* `factory(value)`

    Create an amount with the given value and the default unit.

* `factory.unit(unit)`

    Get a unit that can be used for conversions for this factory.

Instances have the following API:

* `amount.value: Number`

    Get the value of the amount.

* `amount.unit: String`

    Get the unit of the amount.

* `amount.as(unit): Number`

    Convert the amount to the given unit and return the result as a number.

* `amount.to(unit): Amount`

    Convert the amount into another unit and return an object with the value.

Every amount also exposes getters for the most commonly used units:

```javascript
length('20 cm').meters
length('19 ft').cm

volume(1, 'l').oz
```

## Generic amounts

The generic amount does not have any units, but supports SI-prefixes.

```javascript
const { generic } = require('amounts');

// Without any unit, returns an amount with value 20
console.log(generic(20));

// With a generic SI-unit, returns an amount with value 20000
console.log(generic('20k'));

// Full length names are supported
console.log(generic('20 micro'))
```

## SI-prefixes

Units in the SI system can be combined with SI-prefixes to create a new unit.
SI-prefixes are supported both by their short names and their long names.
Examples: `cm`, `milliliters`, `hPa`, `MW`, `kilowatt`

Long Name      | Short name     | Factor              | Factor (expanded)
---------------|----------------|---------------------|-------------------
`yocto`        | `y`            | 10<sup>-24</sup>    | 0.000 000 000 000 000 000 000 001
`zepto`        | `z`            | 10<sup>-21</sup>    | 0.000 000 000 000 000 000 001
`atto`         | `a`            | 10<sup>-18</sup>    | 0.000 000 000 000 000 001
`femto`        | `f`            | 10<sup>-15</sup>    | 0.000 000 000 000 001
`pico`         | `p`            | 10<sup>-12</sup>    | 0.000 000 000 001
`nano`         | `n`            | 10<sup>-9</sup>     | 0.000 000 001
`micro`        | `u`, `mc`, `µ` | 10<sup>-6</sup>     | 0.000 001
`milli`        | `m`            | 10<sup>-3</sup>     | 0.001
`centi`        | `c`            | 10<sup>-2</sup>     | 0.01
`deci`         | `d`            | 10<sup>-1</sup>     | 0.1
`deca`, `deka` | `da`           | 10<sup>1</sup>      | 10
`hecto`        | `h`            | 10<sup>2</sup>      | 100
`kilo`         | `k`            | 10<sup>3</sup>      | 1 000
`mega`         | `M`            | 10<sup>6</sup>      | 1 000 000
`giga`         | `G`            | 10<sup>9</sup>      | 1 000 000 000
`tera`         | `T`            | 10<sup>12</sup>     | 1 000 000 000 000
`peta`         | `P`            | 10<sup>15</sup>     | 1 000 000 000 000 000
`exa`          | `E`            | 10<sup>18</sup>     | 1 000 000 000 000 000 000
`zetta`        | `Z`            | 10<sup>21</sup>     | 1 000 000 000 000 000 000 000
`yotta`        | `Y`            | 10<sup>24</sup>     | 1 000 000 000 000 000 000 000 000

## Angle

```javascript
const { angle } = require('amounts');

console.log(angle(2, 'rad'));
console.log(angle('5 degrees').as('radians'));
```

Unit         | SI   | Names
-------------|------|--------------------
Degree       | No   | `deg`, `degree`, `degrees`
Radian       | Yes  | `rad`, `radian`, `radians`

## Area

```javascript
const { area } = require('amounts');

console.log(area(2, 'm^2'));
console.log(area('10 sq ft').as('m2'));
```

Unit         | SI   | Names
-------------|------|--------------------
Square Meter | Yes  | `m²`, `m^2`, `m2`, `square metre`, `square metres`, `square meter`, `square meters`
Square Inch  | No   | `sq in`, `square inch`, `square inches`
Square Foot  | No   | `sq ft`, `square foot`, `square feet`
Square Yard  | No   | `sq yd`, `square yard`, `square yards`
Square Mile  | No   | `sq mi`, `square mile`, `square miles`
Hectare      | No   | `ha`, `hectare`, `hectares`
Acre         | No   | `acre`, `acres`

## Duration

Durations represent a number of milliseconds something takes. Multiple units
can be combined into a value.

```javascript
const { duration } = require('amounts');

console.log(duration(2000)); // Defaults to milliseconds
console.log(duration('1d'));
console.log(duration('2h 10m'));
console.log(duration('2 days, 5 hours'));
```

Unit         | SI   | Names
-------------|------|---------------------------
Milliseconds | No   | `ms`, `millisecond`, `milliseconds`
Seconds      | No   | `s`, `second`, `seconds`
Minutes      | No   | `m`, `minute`, `minutes`
Hours        | No   | `h`, `hour`, `hours`
Days         | No   | `d`, `day`, `days`

## Energy

```javascript
const { energy } = require('amounts');

console.log(energy(10)); // Joules
console.log(energy('3.5 kJ').kWh);
```

Unit         | SI   | Names
-------------|------|--------------------
Joules       | Yes  | `J`, `j`, `joule`, `joules`
Watt hours   | True | `Wh`, `wh`, `watt hour`, `watt hours`

## Illuminance

```javascript
const { illuminance } = require('amounts');

console.log(illuminance(2, 'lx'));
console.log(angle('8000 lux'));
```

Unit         | SI   | Names
-------------|------|--------------------
Lux          | Yes  | `lx`, `lux`
Phot         | No   | `ph`, `phot`
Nox          | No   | `nx`, `nox`
Foot-candle  | No   | `fc`, `lm/ft²`, `ft-c`, `foot-candle`, `foot-candles`, `foot candle`, `foot candles`


## Length

```javascript
const { length } = require('amounts');

console.log(length(2)); // Meters
console.log(length('5 ft').as('micrometer'));
console.log(length('2 ft ').cm);
```

Unit         | SI   | Names
-------------|------|--------------------
Metre        | Yes  | `m`, `meter`, `meters`, `metre`, `metres`
Inch         | No   | `in`, `inch`, `inches`
Feet         | No   | `ft`, `foot`, `feet`
Yard         | No   | `yd`, `yard`, `yards`
Mile         | No   | `mi`, `mile`, `miles`

## Mass

```javascript
const { mass } = require('amounts');

console.log(mass(210)); // Grams
console.log(mass('78 kg').lbs);
console.log(mass('2 stone').kg)
```

Unit         | SI   | Names
-------------|------|--------------------
Gram         | Yes  | `g`, `gram`, `grams`, `gramme`, `grammes`
Pound        | No   | `lb`, `lbs`, `pound`, `pounds`, `#`
Ounce        | No   | `oz`, `ounce`, `ounces`
Stone        | No   | `st`, `stone`, `stones`

## Power

```javascript
const { power } = require('amounts');

console.log(power(500)); // Watts
console.log(power('6000 kW').mW);
console.log(power('6 hp').as('microwatts'));
```

Unit         | SI   | Names
-------------|------|--------------------
Watt         | Yes  | `w`, `W`, `watt`
Horsepower   | No   | `hp`, `horsepower`

## Pressure

```javascript
const { pressure } = require('amounts');

console.log(pressure(500)); // Pascal
console.log(power('700 hPa').atm);
console.log(power('7 bar').kPa);
```

Unit         | SI   | Names
-------------|------|--------------------
Pascal       | Yes  | `pa`, `Pa`, `pascal`, `pascals`
Atmosphere   | No   | `atm`, `atmosphere`, `atmospheres`
Bar          | No   | `bar`, `bars`
PSI          | No   | `psi`, `pounds per square inch`, `pound per square inch`
Torr         | No   | `torr`
mmHg         | No   | `mmHg`, 'millimetre of mercury', `millimetres of mercury`, `millimeter of mercury`, `millimetres of mercury`

## Sound Pressure Level

```javascript
const { soundPressureLevel } = require('amounts');

console.log(soundPressureLevel(30)); // db
console.log(soundPressureLevel(30, 'dB')); // db
```

Unit         | SI   | Names
-------------|------|--------------------
Decibels     | No   | `dB`, `db`, `dbs`, `decibel`, `decibels`

## Speed

```javascript
const { speed } = require('amounts');

console.log(speed(500)); // m/s
console.log(speed('5 km/s').kph);
console.log(speed('10 mph').mps);
```

Unit           | SI   | Names
---------------|------|--------------------
Metres/Second  | Yes  | `m/s`, `mps`, `metre per second`, `metres per second`, `meter per second`, `meters per second`, `metre/second`, `metres/second`, `meter/second`, `meters/second`
Kilometre/Hour | No   | `km/h`, `kph`, `kilometre per hour`, `kilometres per hour`, `kilometer per hour` `kilometers per hour`, `kilometers/hour`, `kilometre/hour`
Miles/Hour     | No   | `mph`, `mile per hour`, `miles per hour`, `mile/hour`, `miles/hour`
Feet/Second    | No   | `ft/s`, `fps`, `foot per second`, `feet per second`, `foot/second`, `feet/second`
Knot           | No   | `kt`, `knot`, `knots`

## Temperature

```javascript
const { temperature } = require('amounts');

console.log(temperature(22)); // Celsius
console.log(temperature('200 K').celsius);
console.log(temperature(80, 'f').kelvin);
```

Unit         | SI   | Names
-------------|------|--------------------
Celsius      | No   | `C`, `c`, `celsius`
Kelvin       | Yes  | `K`, `kelvin`, `kelvins`
Fahrenheit   | No   | `F`, `f`, `fahrenheit`, `fahrenheits`

## Voltage

```javascript
const { voltage } = require('amounts');

console.log(voltage(22)); // Volts
console.log(voltage('200 V').volts);
```

Unit         | SI   | Names
-------------|------|--------------------
Volt         | Yes  | `V`, `v`, `volt`, `volts`


## Volume

```javascript
const { volume } = require('amounts');

console.log(volume(2)); // Liters
console.log(volume(2, 'quarts').dl);
console.log(volume('20 ml').tbsp);
```

Unit         | SI   | Names
-------------|------|--------------------
Liter        | Yes  | `l`, `L`, `liter`, `litre`, `litre`, `litres`
Gallon       | No   | `gal`, `gallon`, `gallons`
Quart        | No   | `qt`, `quart`, `quarts`
Pint         | No   | `pt`, `pint`, `pints`
Cup          | No   | `cu`, `cup`, `cups`
Fluid ounce  | No   | `floz`, `oz`, `fluid ounce`, `ounce`, `fluid ounces`, `ounces`
Tablespoon   | No   | `tb`, `tbsp`, `tbs`, `tablesppon`, `tablespoons`
Teaspoon     | No   | `tsp`, `teaspoon`, `teaspoons`
