'use strict';

module.exports = require('./quantity')('Mass')
    .base('Gram', {
        names: [ 'g', 'gram', 'grams', 'gramme', 'grammes' ],
        prefix: true,
		exposePrefixes: [ 'kilo' ]
    })
    .add('Pound', {
        names: [ 'lb', 'lbs', 'pound', 'pounds', '#' ],
        scale: 453.592
    })
    .add('Ounce', {
        names: [ 'oz', 'ounce', 'ounces' ],
        scale: 28.3495
    })
    .add('Stone', {
        names: [ 'st', 'stone', 'stones' ],
        scale: 6350.29318
    })
    .build();
