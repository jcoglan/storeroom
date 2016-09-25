var storeroom = require("../../../"),
    jstest    = require("jstest").Test

jstest.describe("LocalStorageAdapter", function() { with(this) {
  describe("localStorage", function() { with(this) {
    this.define("createAdapter", function() {
      return storeroom.createLocalStorageAdapter("prefix")
    })

    this.define("clearAdapter", function(resume) {
      localStorage.clear()
      resume()
    })

    itShouldBehaveLike("storage adapter")
  }})

  describe("sessionStorage", function() { with(this) {
    this.define("createAdapter", function() {
      return storeroom.createLocalStorageAdapter("prefix", sessionStorage)
    })

    this.define("clearAdapter", function(resume) {
      sessionStorage.clear()
      resume()
    })

    itShouldBehaveLike("storage adapter")
  }})
}})
