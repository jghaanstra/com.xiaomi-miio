# abstract-things

`abstract-things` is a JavaScript library that provides a simple base for
building libraries that interact with physical things, such as IoT-devices, and virtual things.

This library provides a base class named `Thing` that supports mixins of
various types. Things are described using two types of tags, one describing
the type of the thing and one describing its capabilities. Things are also
expected to describe their public API, to make remote use easier.

Types and capabilities are designed to be stable and to be combined. When
combined they describe a thing and what it can do.

Detailed documentation is available at: http://abstract-things.readthedocs.io/en/latest/

## Building a simple thing

```
npm install abstract-things
```

A basic thing might look a bit like this:

```javascript
const { Thing } = require('abstract-things');

class SimpleThing extends Thing {
  // Define the type of the thing
  static get type() {
    return 'simple-thing';
  }

  // Quick way to define actions available for this thing
  static get availableAPI() {
    return [ 'hello' ];
  }

  constructor() {
    super();

    // An identifier of the thing should always be set - with a namespace
    this.id = 'thing:example-1';
  }

  hello() {
    return 'Cookies are tasty';
  }
}

console.log(new SimpleThing());
```

## Identifiers and namespaces

Identifiers are required when bulding a thing. They should uniquelly identify
the thing and if possible remain stable over time. In addition that that a
thing should also belong to a namespace. Namespaces are used to make ids unique
when several thing-libraries are used. Namespaces should be short and related
to the type of thing, such as `hue` for Philips Hue lights or `bluetooth`
for Bluetooth peripherals.

## Types and capabilities

Types are used to describe what a thing is and capabilities describe what a
thing can do. A thing can have many capabilities but usually its only a few
types.

This library includes a set of capabilities and types that are intended to
cover many common appliances and devices. Information about these can
be found in the [detailed documentation](http://abstract-things.readthedocs.io/en/latest/).

### Using a capability

Pre-defined capabilities can simply be mixed in when creating a thing:

```javascript
const { Thing, State } = require('abstract-things');

class MyThing extends Thing.with(State) {
  constructor() {
    super();

    this.updateState('key', 'value');
  }
}
```

### Defining a capability

To create a reusable capability you can create a mixin using the `Thing.capability`
function:

```javascript
const { Thing } = require('abstract-things');

module.exports = Thing.capability(BaseThing => class extends BaseThing {
  
  // Tell clients about this capability
  static get capability() {
    return 'cookie-monster';
  }

  // Tell clients about our API
  static availableAPI(builder) {
    builder.action('nom')
      .description('Eat a cookie')
      .argument('string', false, 'The type of cookie to eat')
      .done();
  }
  
  constructor(...args) {
    super(...args);
  }

  nom(cookieType) {
    return 'Ate cookie of type ' + cookieType;
  }
});
```
