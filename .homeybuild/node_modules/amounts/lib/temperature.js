'use strict';

module.exports = require('./quantity')('Temperature')
    .base('Celsius', {
        names: [ 'C', 'c', '°C', 'celsius' ]
    })
    .add('Kelvin', {
        names: [ 'K', '°K', 'kelvin', 'kelvins' ],
        prefix: true,
        toBase: function(value) {
            return value - 273.15;
        },
        fromBase: function(value) {
            return value + 273.15;
        }
    })
    .add('Fahrenheit', {
        names: [ 'F', 'f', '°F', 'fahrenheit', 'fahrenheits' ],
        toBase: function(value) {
            return (value - 32) * (5/9);
        },
        fromBase: function(value) {
            return value * (9/5) + 32;
        }
    })
    .build();
