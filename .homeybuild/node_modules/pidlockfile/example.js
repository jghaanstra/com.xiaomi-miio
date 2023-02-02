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