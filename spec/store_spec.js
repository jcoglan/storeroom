var path    = require("path"),
    rm_rf   = require("rimraf"),
    vstore  = require(".."),
    Promise = require("../lib/util/promise"),
    JS      = require("jstest")

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

  it("concurrently writes to a bucket without losing updates", function(resume) { with(this) {
    assertRespondTo(store, "_getBucketName")
    stub(store, "_getBucketName").returns("0")

    Promise.all([
      store.put("/foo", {a: 1}),
      store.put("/bar", {b: 2})
    ]).then(function() {
      return Promise.all(["/foo", "/bar"].map(store.get, store))
    }).then(function(results) {
      resume(function() { assertEqual([{a: 1}, {b: 2}], results) })
    })
  }})
}})
