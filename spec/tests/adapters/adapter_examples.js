var jstest = require("jstest").Test

jstest.describe("adapters", function() { with(this) {
  sharedExamplesFor("storage adapter", function() { with(this) {
    before(function() { with(this) {
      this.store = createAdapter()
    }})

    after(function(resume) { with(this) {
      clearAdapter(resume)
    }})

    it("returns null for non-existent files", function(resume) { with(this) {
      store.read("non-existent").then(function(result) {
        resume(function() { assertNull(result) })
      })
    }})

    it("reads a file that's been written", function(resume) { with(this) {
      var filename = "a-file"

      store.write(filename, "the contents").then(function() {
        return store.read(filename)
      }).then(function(result) {
        resume(function() { assertEqual("the contents", result) })
      })
    }})

    it("deletes a file by writing null", function(resume) { with(this) {
      var filename = "a-file"

      store.write(filename, "the contents").then(function() {
        return store.write(filename, null)
      }).then(function() {
        return store.read(filename)
      }).then(function(result) {
        resume(function() { assertNull(result) })
      })
    }})
  }})
}})
