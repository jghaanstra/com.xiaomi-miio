'use strict';

module.exports = require('./quantity')('Pressure')
    .base('Pa', {
        names: [ 'Pa', 'pa', 'pascal', 'pascals' ],
        prefix: true,
        exposePrefixes: [ 'hecto', 'kilo' ]
    })
    .add('atm', {
        names: [ 'atm', 'atmosphere', 'atmospheres' ],
        scale: 101325
    })
    .add('bar', {
        names: [ 'bar', 'bars' ],
        scale: 100000
    })
    .add('psi', {
        names: [ 'psi', 'pounds per square inch', 'pound per square inch' ],
        scale: 6894.76
    })
    .add('torr', {
        names: [ 'torr' ],
        scale: 133.322
    })
    .add('mmHg', {
        names: [ 'mmHg', 'millimetre of mercury', 'millimetres of mercury', 'millimeter of mercury', 'millimeters of mercury' ],
        scale: 133.322387415
    })
    .build();
