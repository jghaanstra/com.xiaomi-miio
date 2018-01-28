'use strict'

var leader = require('./')
var test = require('tape')
var split = require('split2')
var count = 0

function testName () {
  return './testing-' + process.pid + '-' + count++
}

function noError (t) {
  return function (err) {
    t.error(err, 'no error')
  }
}

test('single instance', function (t) {
  t.plan(4)

  var elected = false
  var instance = leader(testName())

  instance.on('leader', function () {
    t.pass('elected as leader')
    elected = true
  })

  instance.on('connection', function (sock) {
    // echo
    sock.pipe(sock)
  })

  // client to itself
  instance.on('client', function (sock) {
    sock.write('hello world\n')
    t.ok(elected, 'a leader was elected first')
    sock.pipe(split()).on('data', function (line) {
      t.equal(line, 'hello world')
      instance.close(noError(t))
    })
  })
})

test('two instances', function (t) {
  t.plan(6)

  var name = testName()

  var instance1 = leader(name)

  instance1.on('leader', function () {
    t.pass('leader started')

    var instance2 = leader(name)

    instance2.on('leader', noLeader)
    instance2.once('client', function (sock) {
      sock.pipe(split()).once('data', function (line) {
        t.equal(line, 'hello world')
        instance2.removeListener('leader', noLeader)
        instance2.on('leader', function () {
          t.pass('second leader elected')
        })
        instance2.once('client', function (sock) {
          t.pass('second leader connect to itself')
          instance2.close(noError(t))
        })
        instance1.close(noError(t))
      })
    })
  })

  instance1.on('connection', function (sock) {
    sock.write('hello world\n')
  })

  function noLeader () {
    t.fail('the instance should not be elected leader')
  }
})
