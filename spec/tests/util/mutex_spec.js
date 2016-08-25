var Mutex   = require("../../../lib/util/mutex"),
    Promise = require("../../../").Promise,
    jstest  = require("jstest").Test

jstest.describe("Mutex", function() { with(this) {
  describe("synchronize", function() { with(this) {
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
      this.mutex = new Mutex()
      this.logs  = []
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
}})
