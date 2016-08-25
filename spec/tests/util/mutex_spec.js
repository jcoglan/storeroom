var Mutex   = require("../../../lib/util/mutex"),
    Promise = require("../../../").Promise,
    jstest  = require("jstest").Test

jstest.describe("Mutex", function() { with(this) {
  this.define("delay", function(n) {
    return new Promise(function(resolve) {
      setTimeout(resolve, n)
    })
  })

  this.define("task", function(name, isError) {
    var delay = this.delay, logs = this.logs

    return function() {
      logs.push("begin:" + name)
      return delay(50).then(function() {
        logs.push("end:" + name)
        if (isError) throw new Error()
      })
    }
  })

  before(function() { with(this) {
    this.logs = []
  }})

  describe("synchronize", function() { with(this) {
    before(function() { with(this) {
      this.mutex = new Mutex()
    }})

    it("returns the result of the promise", function(resume) { with(this) {
      var result = mutex.synchronize(function() { return Promise.resolve("It works!") })

      result.then(function(text) {
        resume(function() { assertEqual("It works!", text) })
      })
    }})

    it("returns the error from the promise", function(resume) { with(this) {
      var result = mutex.synchronize(function() { return Promise.reject("Oh no!") })

      result.catch(function(text) {
        resume(function() { assertEqual("Oh no!", text) })
      })
    }})

    it("returns the result of a delayed task", function(resume) { with(this) {
      mutex.synchronize(task("a"))
      var result = mutex.synchronize(function() { return Promise.resolve("It works!") })

      result.then(function(text) {
        resume(function() { assertEqual("It works!", text) })
      })
    }})

    it("executes tasks after one has failed", function(resume) { with(this) {
      mutex.synchronize(task("a", true))
      var result = mutex.synchronize(function() { return Promise.resolve("It works!") })

      result.then(function(text) {
        resume(function() { assertEqual("It works!", text) })
      })
    }})

    it("executes tasks sequentially", function(resume) { with(this) {
      var earlyLog
      mutex.synchronize(task("a"))
      mutex.synchronize(task("b"))

      delay(30).then(function() {
        var result = mutex.synchronize(task("c"))
        earlyLog = logs.slice()
        return result
          
      }).then(function() {
        resume(function() {
          assertEqual( ["begin:a"], earlyLog )

          assertEqual( ["begin:a", "end:a",
                        "begin:b", "end:b",
                        "begin:c", "end:c"], logs )
        })
      })
    }})

    it("executes tasks immediately when the queue is empty", function(resume) { with(this) {
      mutex.synchronize(task("a"))

      delay(60).then(function() {
        mutex.synchronize(task("b"))
        resume(function() { assertEqual(["begin:a", "end:a", "begin:b"], logs) })
      })
    }})
  }})

  describe("multi", function() { with(this) {
    before(function() { with(this) {
      this.mX = new Mutex()
      this.mY = new Mutex()
      this.mZ = new Mutex()
    }})

    it("returns the result of the promise", function(resume) { with(this) {
      var result = Mutex.multi([mX, mY, mZ], function() {
        return Promise.resolve("They all work!")
      })

      result.then(function(text) {
        resume(function() { assertEqual("They all work!", text) })
      })
    }})

    it("locks all the mutexes", function(resume) { with(this) {
      Promise.all([
        Mutex.multi([mX, mY, mZ], task("all")),
        mX.synchronize(task("X")),
        mY.synchronize(task("Y")),
        mZ.synchronize(task("Z"))

      ]).then(function() {
        resume(function() {
          assertEqual( ["begin:all", "end:all",
                        "begin:Z", "begin:Y", "begin:X",
                        "end:Z", "end:Y", "end:X"], logs )
        })
      })
    }})

    it("waits if some mutexes are already busy", function(resume) { with(this) {
      Promise.all([
        mY.synchronize(task("Y")),
        mZ.synchronize(task("Z")),
        Mutex.multi([mX, mY, mZ], task("all")),
        mX.synchronize(task("X"))

      ]).then(function() {
        resume(function() {
          assertEqual( ["begin:Y", "begin:Z",
                        "end:Y", "end:Z",
                        "begin:all", "end:all",
                        "begin:X", "end:X"], logs )
        })
      })
    }})

    it("allows mutexes it hasn't claimed yet to be used", function(resume) { with(this) {
      Promise.all([
        mX.synchronize(task("X")),
        mY.synchronize(task("Y")),
        Mutex.multi([mX, mY, mZ], task("all")),
        mZ.synchronize(task("Z"))

      ]).then(function() {
        resume(function() {
          assertEqual( ["begin:X", "begin:Y", "begin:Z",
                        "end:X", "end:Y", "end:Z",
                        "begin:all", "end:all"], logs )
        })
      })
    }})
  }})
}})
