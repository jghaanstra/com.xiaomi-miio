'use strict';

module.exports = require('./quantity')('Energy')
    .base('Joule', {
        names: [ 'J', 'j', 'joule', 'joules' ],
        prefix: true,
		exposePrefixes: [ 'kilo', 'mega' ]
    })
    .add('Watt hour', {
        names: [ 'Wh', 'wh', 'watt hour', 'watt hours' ],
        scale: 3600,
        prefix: true,
        exposePrefixes: [ 'kilo', 'mega' ]
    })
    .build();
