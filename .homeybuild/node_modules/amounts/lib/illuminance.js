'use strict';

module.exports = require('./quantity')('Illuminance')
    .base('Lux', {
        names: [ 'lx', 'lux' ],
		prefix: true
    })
	.add('Phot', {
		names: [ 'ph', 'phot' ],
		scale: 1000
	})
	.add('Nox', {
		names: [ 'nx', 'nox' ],
		scale: 0.001
	})
	.add('Foot-candle', {
		names: [ 'fc', 'lm/ft²', 'ft-c', 'foot-candle', 'foot-candles', 'foot candle', 'foot candles' ],
		scale: 10.764
	})
    .build();
