'use strict';

module.exports = require('./quantity')('Voltage')
    .base('Volt', {
        names: [ 'V', 'v', 'volt', 'volts' ],
        prefix: true,
    })
    .build();
