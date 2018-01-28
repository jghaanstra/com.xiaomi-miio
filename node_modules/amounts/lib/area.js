'use strict';

module.exports = require('./quantity')('Area')
    .base('Square metre', {
        names: [ 'm²', 'm^2', 'm2', 'square metre', 'square metres', 'square meter', 'square meters' ],
        prefix: 2,
        exposePrefixes: [ 'centi', 'kilo' ]
    })
    .add('Square inch', {
		names: [ 'sq in', 'square inch', 'square inches' ],
		scale: 0.00064516
	})
	.add('Square foot', {
		names: [ 'sq ft', 'square foot', 'square feet' ],
		scale: 0.092903
	})
	.add('Square yard', {
		names: [ 'sq yard', 'square yard', 'square yards' ],
		scale: 0.836127
	})
	.add('Square mile', {
		names: [ 'sq mi', 'square mile', 'square miles' ],
		scale: 2589988.10
	})
	.add('Hectare', {
		names: [ 'ha', 'hectare', 'hectares' ],
		scale: 10000
	})
	.add('Acre', {
		names: [ 'acre', 'acres' ],
		scale: 4046.86
	})
    .build();
