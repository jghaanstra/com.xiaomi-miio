# Dwaal

> **dwaal**. A dreamy, dazed, absent-minded, or befuddled state. [Wiktionary](https://en.wiktionary.org/wiki/dwaal)

Dwaal is a persisted key-value storage for Node JS that can be shared by
several processes on the same local machine.

## Usage

```javascript

const Storage = require('dwaal');

const storage = new Storage({
  path: 'directory/that/exists'
});

// Get something
storage.get('cookie')
  .then(value => console.log('Value was', value))
  .catch(handleErrorHere);

// Set something
storage.set('cookie', 'Cookies are tasty')
  .then(() => console.log('Data has been set'))
  .catch(handleErrorHere);
```

## How it works

Dwaal connects processes that use the same storage together via a Unix
socket and elects a process to leader that is responsible for managing the
storage. This leader keeps an in-memory map with all of the data and handles requests from other processes that want to get or set data.

When the data in the storage changes it is lazily written around every 500
ms. Data is always written atomically to minimize the chance of the storage
file being corrupted.
