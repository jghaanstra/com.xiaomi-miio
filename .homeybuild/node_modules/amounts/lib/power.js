'use strict';

module.exports = require('./quantity')('Power')
    .base('Watt', {
        names: [ 'w', 'W', 'watt', 'watts' ],
        prefix: true,
        exposePrefixes: [ 'kilo', 'mega' ]
    })
    .add('Horsepower', {
        names: [ 'hp', 'horsepower', 'horsepowers' ],
        scale: 745.69987158227022
    })
    .build();
