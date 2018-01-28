'use strict';

module.exports = require('./quantity')('Speed')
    .base('Metres per second', {
        names: [ 'm/s', 'mps', 'metre per second', 'metres per second', 'meter per second', 'meters per second', 'metre/second', 'metres/second', 'meter/second', 'meters/second' ],
        prefix: true
    })
    .add('Kilometres per hour', {
        names: [ 'km/h', 'kph', 'kilometre per hour', 'kilometres per hour', 'kilometer per hour', 'kilometers per hour', 'kilometre/hour', 'kilometres/hour', 'kilometer/hour', 'kilometers/hour' ],
        scale: 1000 / 3600
    })
    .add('Miles per hour', {
        names: [ 'mph', 'mile per hour', 'miles per hour', 'mile/hour', 'miles/hour' ],
        scale: 0.44704
    })
    .add('Feet per second', {
        names: [ 'ft/s', 'fps', 'foot per second', 'feet per second', 'foot/second', 'feet/second' ],
        scale: 0.3048
    })
    .add('Knot', {
        names: [ 'kt', 'knot', 'knots' ],
        scale: 0.514444
    })
    .build();
