var LocalStorageAdapter = require("../../../lib/adapters/local_storage"),
    jstest              = require("jstest").Test

jstest.describe("LocalStorageAdapter", function() { with(this) {
  describe("localStorage", function() { with(this) {
    this.define("createAdapter", function() {
      return new LocalStorageAdapter("prefix")
    })

    this.define("clearAdapter", function(resume) {
      localStorage.clear()
      resume()
    })

    itShouldBehaveLike("storage adapter")
  }})

  describe("sessionStorage", function() { with(this) {
    this.define("createAdapter", function() {
      return new LocalStorageAdapter("prefix", sessionStorage)
    })

    this.define("clearAdapter", function(resume) {
      sessionStorage.clear()
      resume()
    })

    itShouldBehaveLike("storage adapter")
  }})
}})
