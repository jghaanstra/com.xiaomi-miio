# unix-socket-leader
[![travis][travis-badge]][travis-url]
[![git][git-badge]][git-url]
[![npm][npm-badge]][npm-url]

Elect a leader using unix sockets, inspired by
[level-party](http://npm.im/level-party) and a late night conversation
with [@mafitonsh](http://github.com/mafintosh) at
[nodejsconf.it](http://nodejsconf.it).

* [Install](#install)
* [Example](#example)
* [API](#api)
* [License](#license)

<a name="install"></a>
## Install
To install unix-socket-leader, simply use npm:

```
npm install unix-socket-leader --save
```

<a name="example"></a>
## Example

The example below can be found [here][example] and ran using `node example.js`. It
demonstrates how to use unix-socket-leader to build a simple chat room.

```js
'use strict'

var leader = require('unix-socket-leader')('chat')
var eos = require('end-of-stream')
var sockets = []
var popts = { end: false }

leader.on('leader', function () {
  console.log('!! I am the the leader now', process.pid)
})

leader.on('connection', function (sock) {
  sock.write('!! connected to ' + process.pid)
  sock.write('\n')

  sockets.forEach(function (other) {
    other.pipe(sock, popts).pipe(other, popts)
  })

  sockets.push(sock)

  eos(sock, function () {
    sockets.splice(sockets.indexOf(sock), 1)
  })
})

leader.on('client', function (sock) {
  process.stdout.pipe(sock, popts).pipe(process.stdout, popts)
})
```

<a name="api"></a>
## API

  * <a href="#constructor"><code><b>leader()</b></code></a>
  * <a href="#close"><code>instance.<b>close()</b></code></a>

-------------------------------------------------------
<a name="constructor"></a>
### leader(name)

Creates a new instance of unix-socket-leader.

Events:

* `leader`, emitted when this instance is elected leader
* `client`, emitted when this instance is connected to a leader (even
  itself); the first argument is the connected socket
* `connection`, emitted when there is a new incoming connection, and
  this instance is the leader; the first argument is the connected socket

-------------------------------------------------------
<a name="close"></a>
### instance.close([cb])

Closes the instance, severing all current connections.

## License

Copyright Matteo Collina 2015, Licensed under [MIT][].

[MIT]: ./LICENSE
[example]: ./example.js

[travis-badge]: https://img.shields.io/travis/mcollina/unix-socket-leader.svg?style=flat-square
[travis-url]: https://travis-ci.org/mcollina/unix-socket-leader
[git-badge]: https://img.shields.io/github/release/mcollina/unix-socket-leader.svg?style=flat-square
[git-url]: https://github.com/mcollina/unix-socket-leader/releases
[npm-badge]: https://img.shields.io/npm/v/unix-socket-leader.svg?style=flat-square
[npm-url]: https://npmjs.org/package/unix-socket-leader
