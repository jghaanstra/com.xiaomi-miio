# Foibles

> **foible**. A quirk, idiosyncrasy, or mannerism; unusual habit or way (usage is typically plural), that is slightly strange or silly. [Wiktionary](https://en.wiktionary.org/wiki/foible)

Foibles is a library for composing JavaScript classes with support for mixins.
The library provides utilities to supply limited mixin capabilities to a class.

Foibles is available on NPM: `npm install foibles`

## Creating a base class

To create an extendable class call `toExtendable`:

```javascript
const { toExtendable } = require('foibles');

const Extendable = toExtendable(class BaseClass {
	doStuff() {
		console.log('base class did stuff');
	}
});
```

## Creating mixins

Mixins are functions that creates a class that have a dynamic super class. This
makes it so that things as `super` work as intended and that mixins can override
functions in their parent class.

```javascript
const { Mixins } = require('foibles');

const SomeMixin = Mixin(parentclass => class MixinClass extends parentclass {
	doMixinStuff() {
		console.log('mixin did stuff');
	}
});
```

## Using mixins

`Extendable` will be enhanced with a static `with` function that provides
the mixin functionality. To sub class `Extendable` and at the same time
use `SomeMixin`:

```javascript
class SubClass extends Extendable.with(SomeMixin) {

	doStuff() {
		// Allow super class to do stuff
		super.doStuff();

		// doMixinStuff was provided via SomeMixin
		this.doMixinStuff();
	}
}
```

Use `instanceof` to check if an object has a mixin:

```javascript
const object = new SubClass();
console.log(object instanceof SubClass);
```

Note: It's possible to use `instanceof` only if `Symbol.hasInstance` is supported.
For Node you should run Node 6.11 or later. Browser compatibility has not been tested.

## Advanced: Creating mixins that are also classes

In some cases its useful to provide the same functionality both as a mixin
and a class that can be directly extended. In those cases `Class` can be
used:

```javascript
class { Class } = require('foibles');

// Create a class by extending Extendable
const MixinAndClass = Class(Extendable, parentclass => class MixinAndClass extends parentclass {
	doStuff() {
		super.doStuff();
	}
});

// Possible to create the class directly:
new MixinAndClass();
```
