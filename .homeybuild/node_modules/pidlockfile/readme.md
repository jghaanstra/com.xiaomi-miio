# pidlockfile[![build status](https://secure.travis-ci.org/kesla/pidlockfile.svg)](http://travis-ci.org/kesla/pidlockfile)

Ensure that at most one instance is running, based on PIDs

[![NPM](https://nodei.co/npm/pidlockfile.png?downloads&stars)](https://nodei.co/npm/pidlockfile/)

[![NPM](https://nodei.co/npm-dl/pidlockfile.png)](https://nodei.co/npm/pidlockfile/)

## Installation

```
npm install pidlockfile
```

## Example

### Input

```javascript
var lockFile = require('./pidlockfile')

  , filename = __dirname + '/LOCKFILE'

lockFile.lock(filename, function (err) {
  lockFile.check(filename, function (err, locked) {
    console.log('the lockFile is locked', locked)

    lockFile.lock(filename, function (err) {
      console.log(err)
      lockFile.unlock(filename)
    })
  })
})
```

### Output

```
the lockFile is locked true
[Error: Lockfile already acquired]
```

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
