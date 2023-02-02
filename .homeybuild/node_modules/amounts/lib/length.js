'use strict';

module.exports = require('./quantity')('Length')
    .base('Meter', {
        names: [ 'm', 'meter', 'meters', 'metre', 'metres' ],
        prefix: true,
        exposePrefixes: [ 'deci', 'milli', 'centi' ]
    })
    .add('Inch', {
        names: [ 'in', 'inch', 'inches' ],
        scale: 0.0254
    })
    .add('Foot', {
        names: [ 'ft', 'foot', 'feet' ],
        scale: 0.3048
    })
    .add('Yard', {
        names: [ 'yd', 'yard', 'yards' ],
        scale: 0.9144
    })
    .add('Mile', {
        names: [ 'mi', 'mile', 'miles' ],
        scale: 1609.34
    })
    .build();
