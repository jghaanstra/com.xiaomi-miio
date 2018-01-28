'use strict'

var net = require('net')
var fs = require('fs')
var path = require('path')
var EE = require('events').EventEmitter
var eos = require('end-of-stream')
var lockfile = require('pidlockfile')

function leader (file) {
  var that = new EE()
  var sockPath = path.resolve(process.cwd(), file)
  var lock = sockPath + '.lock'
  var client = null
  var server = null
  var sockets = []
  var closed = false

  if (process.platform === 'win32') {
    sockPath = '\\\\' + sockPath
  }

  that.close = close

  tryConnect()

  return that

  function tryConnect () {
    if (closed) return

    var client = net.connect(sockPath)
    var removeEos

    client.on('error', function (err) {
      client = null

      if (removeEos) {
        removeEos()
      }

      if (err.code === 'ECONNREFUSED' || err.code === 'ENOENT') {
        return setTimeout(unlinkAndStart, 50 + Math.random() * 100)
      }

      return that.emit('error', err)
    })

    client.on('connect', function () {
      that.emit('client', client)

      removeEos = eos(client, tryConnect)
    })
  }

  function unlinkAndStart () {
    if (closed) return

    lockfile.lock(lock, function (err) {
      if (err) {
        return tryConnect()
      }

      fs.unlink(sockPath, function () {
        startServer()
      })
    })
  }

  function startServer () {
    server = net.createServer(function (sock) {
      sock.unref()
      sockets.push(sock)
      that.emit('connection', sock)
      eos(sock, function () {
        sockets.splice(sockets.indexOf(sock), 1)
      })
    })

    server.listen(sockPath, function () {
      that.emit('leader')
      tryConnect()
    })

    server.on('error', tryConnect)

    server.unref()
  }

  function close (cb) {
    closed = true
    if (server) {
      try {
        fs.unlinkSync(sockPath)
        fs.unlinkSync(lock)
      } catch (err) {
        // somebody else unlinked the locks
      }
      sockets.forEach(function (sock) {
        sock.destroy()
      })
      server.close(cb)
    } else if (client) {
      if (cb) {
        eos(client, cb)
      }
      client.destroy()
    } else {
      cb()
    }
  }
}

module.exports = leader
