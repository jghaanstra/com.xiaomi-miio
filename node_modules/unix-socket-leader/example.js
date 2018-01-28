'use strict'

var leader = require('./')('chat')
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

