var fs = require('fs')

  , pid = process.pid.toString()

  , check = function (filename, callback) {
      fs.readFile(filename, { encoding: 'utf8' }, function (err, otherPid) {
        if (err) return callback(err)

        otherPid = parseInt(otherPid, 10)

        try {
          process.kill(otherPid, 0)
          callback(null, true)
        } catch(e) {
          callback(null, false)
        }
      })
    }

  , lock = function (filename, callback) {
      check(filename, function (err, locked) {
        if (err && err.code === 'ENOENT') {
          fs.writeFile(filename, pid, { flag: 'wx' }, callback)
        } else if (err || locked && (err = new Error('Lockfile already acquired'))) {
          callback(err)
        } else {
          //not error and file isn't locked, so must unlink file first
          fs.unlink(filename, function (err) {
            if (err) {
              callback(err)
            } else {
              fs.writeFile(filename, pid, { flag: 'wx' }, callback)
            }
          })
        }
      })
    }
  , unlock = function (filename, callback) {
      fs.unlink(filename, callback)
    }

module.exports = {
    lock: lock
  , check: check
  , unlock: unlock
}