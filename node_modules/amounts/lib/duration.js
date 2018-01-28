'use strict';

module.exports = require('./quantity')('Duration')
    .multiple()
    .base('Milliseconds', {
        names: [ 'ms', 'millisecond', 'milliseconds' ],
    })
    .add('Seconds', {
        names: [ 's', 'second', 'seconds' ],
        scale: 1000
    })
    .add('Minutes', {
        names: [ 'm', 'minute', 'minutes' ],
        scale: 60000
    })
    .add('Hours', {
        names: [ 'h', 'hour', 'hours' ],
        scale: 60000 * 60
    })
    .add('Days', {
        names: [ 'd', 'day', 'days' ],
        scale: 60000 * 60 * 24
    })
    .build();
