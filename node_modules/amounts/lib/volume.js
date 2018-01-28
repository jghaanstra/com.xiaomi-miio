'use strict';

module.exports = require('./quantity')('Volume')
    .base('Litre', {
        names: [ 'L', 'l', 'ltr', 'liter', 'liters', 'litre', 'litres' ],
        prefix: true,
        exposePrefixes: [ 'deci', 'milli', 'centi' ]
    })
    .add('Cubic metre', {
        names: [ 'm³', 'm^3', 'm3', 'cubic metre', 'cubic metres', 'cubic meter', 'cubic meters' ],
        prefix: 3,
        exposesPrefixes: [ 'centi' ],
        scale: 1000
    })
    .add('Gallon', {
        names: [ 'gal', 'gallon', 'gallons' ],
        scale: 3.78541
    })
    .add('Quart', {
        names: [ 'qt', 'quart', 'quarts' ],
        scale: 0.946353
    })
    .add('Pint', {
        names: [ 'pt', 'pint', 'pints' ],
        scale: 0.373176
    })
    .add('Cup', {
        names: [ 'cu', 'cup', 'cups' ],
        scale: 0.236588
    })
    .add('Fluid ounce', {
        names: [ 'floz', 'oz', 'fluid ounce', 'ounce', 'fluid ounces', 'ounces' ],
        scale: 0.0295735
    })
    .add('Tablespoon', {
        names: [ 'tb', 'tbsp', 'tbs', 'tablespoon', 'tablespoons' ],
        scale: 0.0147868
    })
    .add('Teaspoon', {
        names: [ 'tsp', 'teaspoon', 'teaspoons' ],
        scale: 0.00492892
    })
    .build();
