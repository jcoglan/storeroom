var path   = require("path"),
    rm_rf  = require("rimraf"),
    vstore = require(".."),
    JS     = require("jstest")

var storepath = path.resolve(__dirname, "_tmp")

JS.Test.describe("store", function() { with(this) {
  before(function() {
    this.store = vstore.createStore({
      password: "the-password",
      adapter:  vstore.createFileAdapter(storepath)
    })
  })

  after(function(resume) {
    rm_rf(storepath, resume)
  })

  it("returns undefined for an unknown key", function(resume) { with(this) {
    store.get("/nope").then(function(result) {
      resume(function() { assertEqual(undefined, result) })
    })
  }})

  it("stores and retrieves a document", function(resume) { with(this) {
    store.put("/foo", {hello: "world"}).then(function() {
      return store.get("/foo")
    }).then(function(result) {
      resume(function() { assertEqual({hello: "world"}, result) })
    })
  }})
}})
