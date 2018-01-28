'use strict';

function noop(value) {
    return value;
}

const prefixDefinitions = [
    {
        names: [ 'y', 'yocto' ],
        scale: 1e-24
    },
    {
        names: [ 'z', 'zepto' ],
        scale: 1e-21
    },
    {
        names: [ 'a', 'atto' ],
        scale: 1e-18
    },
    {
        names: [ 'f', 'femto' ],
        scale: 1e-15
    },
    {
        names: [ 'p', 'pico' ],
        scale: 1e-12
    },
    {
        names: [ 'n', 'nano' ],
        scale: 1e-9
    },
    {
        names: [ 'u', 'micro', 'mikro', 'mc', '\u03BC', '\u00B5' ],
        scale: 1e-6
    },
    {
        names: [ 'm', 'milli' ],
        scale: 1e-3
    },
    {
        names: [ 'c', 'centi' ],
        scale: 1e-2
    },
    {
        names: [ 'd', 'deci' ],
        scale: 1e-1
    },
    {
        names: [ 'da', 'deca', 'deka' ],
        scale: 1e1
    },
    {
        names: [ 'h', 'hecto' ],
        scale: 1e2
    },
    {
        names: [ 'k', 'K', 'kilo' ],
        scale: 1e3
    },
    {
        names: [ 'M', 'mega' ],
        scale: 1e6
    },
    {
        names: [ 'G', 'giga' ],
        scale: 1e9
    },
    {
        names: [ 'T', 'tera' ],
        scale: 1e12
    },
    {
        names: [ 'P', 'peta' ],
        scale: 1e15
    },
    {
        names: [ 'E', 'exa' ],
        scale: 1e18
    },
    {
        names: [ 'Z', 'zetta' ],
        scale: 1e21
    },
    {
        names: [ 'Y', 'yotta' ],
        scale: 1e24
    }
];

const prefixes = createUnits(prefixDefinitions, true);

const SIGN = '[+-]';
const INT = '\\d+';
const SIGNED_INT = SIGN + '?' + INT;
const FRACTION = '\\.' + INT;
const FLOAT = '(?:' + INT + '(?:' + FRACTION + ')?)' + '|(?:' + FRACTION + ')';
const EXP = '[Ee]' + SIGNED_INT;
const EXP_NUMBER = '(?:' + FLOAT + ')(?:' + EXP + ')?';
const NUMBER = SIGN + '?\\s*' + EXP_NUMBER;

function normalizeUnitName(name) {
    return name.replace(/\s+(\w|$)/g, (m, c) => c.toUpperCase());
}

function unitToLower(name) {
    return name.length > 2 ? name.toLowerCase() : name;
}

/**
 * Map a list of conversions into an object where each name is represented
 * as a key.
 */
function createUnits(conversions, withNames=false) {
    const result = {};
    conversions.forEach(c => c.names.forEach(name =>
        result[unitToLower(normalizeUnitName(name))] = {
            name: c.names[0],

            prefix: c.prefix,

            scale: c.scale,
            toBase: c.toBase,
            fromBase: c.fromBase,

            names: withNames ? c.names : null
        }
    ));
    return result;
}

/**
 * Create a case insensitive part of a regex by taking each letter in a
 * string and turning it into `[Aa]`.
 */
function caseInsensitivePart(value) {
    let result = [];
    for(let i=0; i<value.length; i++) {
        const c = value[i];
        const l = c.toLowerCase();
        const u = c.toUpperCase();

        if(l !== u) {
            result.push('[' + l + u + ']');
        } else {
            result.push(l);
        }
    }
    return result.join('');
}

/**
 * Create a regex for the given associative object.
 */
function createUnitRegex(units) {
    return Object.keys(units)
        .sort((a, b) => b.length - a.length)
        .map(unit => unit.length > 2 ? caseInsensitivePart(unit) : unit)
        .join('|');
}

/**
 * Create a method that calls as for the given unit.
 */
function createAs(unit) {
    return function() {
        return this.as(unit);
    };
}

class Factory {
    constructor(name, conversions, multiple) {
        this.name = name;
        this.base = conversions[0].names[0];
        this.conversions = conversions;
        this.units = createUnits(conversions);
        this.multiple = multiple;

        let parsing = this.parsing = {};
        parsing.unitPart = createUnitRegex(this.units);
        //parsing.unitEndRegExp = new RegExp('(' + parsing.unitPart + ')\s*$');
        parsing.prefixPart = createUnitRegex(prefixes);
        //parsing.prefixRegExp = new RegExp('(' + parsing.prefixPart + ')+');
        parsing.single = new RegExp('^\\s*(' + NUMBER + ')\\s*(.+?)?\\s*$');
        parsing.multiple = new RegExp('\\s*' + NUMBER + '\\s*(?:[a-zA-Z0-9]+)?\\s*', 'g');
        parsing.unit = new RegExp('^(' + parsing.prefixPart + ')?(' + parsing.unitPart + ')$');

        this.formatter = typeof Intl === 'object' ? new Intl.NumberFormat() : {
            format: function(e) { return String(e) }
        };

        // Create the instance factory
        const Value = this[name] = new Function('return function ' + name + '(value, unit){ this.value = value; this.unit = unit; }')();

        Object.defineProperty(Value.prototype, 'amounts:type', {
            value: name,
        });

        const self = this;

        /*
         * Method that converts the current value into another unit and
         * returns just the converted number
         */
        Value.prototype.as = function(unit) {
            if(this.unit === unit) {
                return this.value;
            }

            return self.convert(this.value, this.unit, unit);
        };

        /*
         * Convert this value into another unit and return it as an object.
         */
        Value.prototype.to = function(unit) {
            // Resolve the unit to use
            unit = self._findConversion(unit).name;
            if(this.unit === unit) {
                return this;
            }
            const v = self.convert(this.value, this.unit, unit);
            return new Value(v, unit);
        };

        /**
         * Check if the value is using the given unit.
         */
        Value.prototype.is = function(unit) {
            unit = self._findConversion(unit, false);
            if(! unit) return false;

            return this.unit === unit.name;
        };

        Value.prototype.toString = function() {
            let result = self.formatter.format(this.value);
            if(this.unit.length > 0) {
                result += ' ' + this.unit;
            }
            return result;
        };

        // Go through all conversions and expose getters for them
        for(let key of Object.keys(this.conversions)) {
            const conversion = this.conversions[key];
            for(let cName of conversion.names) {
                Object.defineProperty(Value.prototype, normalizeUnitName(cName), {
                    get: createAs(cName)
                });
            }

            for(let pId of conversion.exposePrefixes) {
                const prefix = prefixes[pId];
                for(let pName of prefix.names) {
                    for(let cName of conversion.names) {
                        let unitName = pName + normalizeUnitName(cName);
                        Object.defineProperty(Value.prototype, unitName, {
                            get: createAs(unitName)
                        });
                    }
                }
            }
        }
    }

    _instance(value, unit) {
        return new this[this.name](value, unit);
    }

    create(value, unit) {
        if(value instanceof this[this.name]) {
            return value;
        }

        const type = typeof value;
        if(type === 'string') {
            if(typeof unit !== 'undefined') {
                // If a unit has also been provided parse value as just a number
                value = this._parseNumber(value);
                unit = this._findConversion(unit).name;

                return this._instance(value, unit);
            }

            return this._parse(value);
        } else if(type === 'number') {
            if(unit) {
                unit = this._findConversion(unit).name;
            }
            return this._instance(value, unit || this.base);
        } else if(type === 'object') {
            unit = this._findConversion(value.unit).name;
            return this.create(value.value, unit);
        } else {
            throw new Error('Unable to create value');
        }
    }

    _findConversion(unit, throwErrors=true) {
        const normalized = normalizeUnitName(unit);
        const c = this.units[normalized];
        if(c) return c;

        const parsed = this.parsing.unit.exec(normalized);
        if(! parsed) {
            if(throwErrors) {
                throw new Error('Unsupported unit: ' + unit);
            } else {
                return null;
            }
        }

        const lastPart = unitToLower(parsed[parsed.length - 1]);
		const hasPrefix = parsed[parsed.length - 2] !== undefined;

        const baseUnit = this.units[lastPart];
        let shortUnit = baseUnit.name;
        let scale = 1;
        if(baseUnit.prefix) {
            // This unit supports prefixes, check if we have been given a supported prefix
            if(hasPrefix) {
                const prefix = prefixes[unitToLower(parsed[1])];
                if(! prefix) {
                    throw new Error('Unsupported unit, resolved to `' + baseUnit.name + '` but could not parse prefix of full unit: ' + unit);
                }
                scale = baseUnit.prefix > 1 ? Math.pow(prefix.scale, baseUnit.prefix) : prefix.scale;
                shortUnit = prefix.name + shortUnit;
            }
        } else {
            // Unit does not support prefixes, make sure we don't have one
            if(hasPrefix) {
                if(throwErrors) {
                    throw new Error('Unit `' + parsed[parsed.length - 1] + '` does not support prefixes, can not parse: ' + unit);
                } else {
                    return null;
                }
            }
        }

        if(scale == 1) {
            return baseUnit;
        } else {
            this.units[shortUnit] = {
                name: shortUnit,

                toBase: function(value) {
                    return baseUnit.toBase(value * scale);
                },

                fromBase: function(value) {
                    return baseUnit.fromBase(value) / scale;
                }
            };

            return this.units[shortUnit];
        }
    }

    convert(value, unit, newUnit) {
        if(unit === newUnit) return value;

        let from = this._findConversion(unit);
        let to = this._findConversion(newUnit);

        const base = from.toBase(value);
        return to.fromBase(base);
    }

    convertWithParse(newUnit, value, unit) {
        if(value instanceof this[this.name]) {
            return value.as(unit);
        }

        const type = typeof value;
        if(type === 'string') {
            if(typeof unit !== 'undefined') {
                // If a unit has also been provided parse value as just a number
                value = this._parseNumber(value);
            } else {
                const parsed = this._parse(value);
                value = parsed.value;
                unit = parsed.unit;
            }
        } else if(type === 'number') {
            if(unit) {
                unit = this._findConversion(unit);
            } else {
                unit = this.base;
            }
        } else if(type === 'object') {
            unit = value.unit;
            value = value.value;
        } else {
            throw new Error('Unable to create value');
        }

        if(typeof unit === 'string') {
            unit = this._findConversion(unit);
        }

        if(unit.name === newUnit.name) return value;

        const base = unit.toBase(value);
        return newUnit.fromBase(base);
    }

    _parseNumber(value) {
        const parts = this.parsing.single.exec(value);
        if(! parts) {
            throw new Error('Unable to parse ' + this.name + ': ' + value);
        }

        if(parts[2]) {
            throw new Error('Can not specify unit twice, use either a single string or a number + unit as arguments');
        }

        return parseFloat(parts[1]);
    }

    _parseSingle(value) {
        const parts = this.parsing.single.exec(value);
        if(! parts) {
            throw new Error('Unable to parse ' + this.name + ': ' + value);
        }
        const number = parts[1]
        let unit = parts[2];
        if(! unit) {
            unit = this.base;
        }

        // Verify that we can parse the unit
        unit = this._findConversion(unit).name;

        let amount = parseFloat(number);
        if(this.base === '') {
            // Special case for generic amount
            amount = this.units[unit].toBase(amount);
            unit = '';
        }

        return [ amount, unit ];
    }

    _parse(value) {
        if(this.multiple) {
            this.parsing.multiple.lastIndex = 0;
            let baseValue = 0;
            let parsed;
            while((parsed = this.parsing.multiple.exec(value))) {
                let v = this._parseSingle(parsed[0]);
                baseValue += this.convert(v[0], v[1], this.base);
            }

            return this._instance(baseValue, this.base);
        } else {
            const v = this._parseSingle(value);

            return this._instance(v[0], v[1]);
        }
    }

    unit(unit) {
        unit = this._findConversion(unit);

        return {
            name: unit.name,

            convert: this.convertWithParse.bind(this, unit)
        };
    }

    listUnits() {
        return this.conversions.map((c, idx) => ({
            name: c.name,
            symbol: c.names[0],

            supportsPrefixes: !! c.prefix,

            isDefault: idx == 0,
            names: c.names
        }));
    }
}

class QuantityBuilder {
    constructor(name) {
        this.name = name;
        this.conversions = [];
    }

    multiple() {
        this._multiple = true;
        return this;
    }

    base(name, opts) {
        this._base = opts.names;
        this.conversions.push({
            name: name,

            names: opts.names,
            prefix: opts.prefix || false,
            exposePrefixes: opts.exposePrefixes || [],
            toBase: noop,
            fromBase: noop
        });

        return this;
    }

    add(name, opts) {
        let toBase;
        let fromBase;
        if(opts.scale) {
            toBase = function(value) {
                return value * opts.scale;
            };

            fromBase = function(value) {
                return value / opts.scale;
            }
        } else {
            toBase = opts.toBase;
            fromBase = opts.fromBase;
        }

        this.conversions.push({
            name: name,

            names: opts.names,
            prefix: opts.prefix || false,
            exposePrefixes: opts.exposePrefixes || [],
            toBase: toBase,
            fromBase: fromBase,
        });

        return this;
    }

    build() {
        if(! this._base) {
            this.base('', { names: [ '' ], prefix: true })
        }

        const factory = new Factory(this.name, this.conversions, this._multiple);
        const result = factory.create.bind(factory);
        result.toJSON = function(value) {
            return {
                value: value.value,
                unit: value.unit
            }
        };
        result.is = function(value) {
            return value && factory.name === value['amounts:type'];
        };
        Object.defineProperty(result, 'units', {
            get: factory.listUnits.bind(factory)
        });
        result.unit = factory.unit.bind(factory);
        return result;
    }
}

module.exports = function(name) {
    return new QuantityBuilder(name);
};
