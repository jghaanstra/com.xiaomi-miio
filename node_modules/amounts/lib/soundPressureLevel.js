'use strict';

module.exports = require('./quantity')('SoundPressure')
    .base('Decibel', {
        names: [ 'dB', 'db', 'dbs', 'decibel', 'decibels' ],
        prefix: true,
    })
    .build();
