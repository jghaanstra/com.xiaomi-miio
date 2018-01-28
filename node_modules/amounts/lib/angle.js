'use strict';

module.exports = require('./quantity')('Angle')
    .base('Degrees', {
        names: [ 'deg', 'degree', 'degrees' ],
    })
    .add('Radians', {
        names: [ 'rad', 'radian', 'radians' ],
        scale: 360 / (2 * Math.PI),
		prefix: true
    })
    .build();
