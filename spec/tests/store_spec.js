var storeroom  = require("../../"),
    MasterKeys = require("../../lib/store/master_keys"),
    Promise    = storeroom.Promise,
    testStore  = require("../test_store"),
    jstest     = require("jstest").Test

jstest.describe("store", function() { with(this) {
  this.define("createStore", function() {
    return storeroom.createStore({
      password: "the-password",
      adapter:  testStore.create()
    })
  })

  before(function() {
    this.store = this.createStore()
  })

  after(function(resume) {
    testStore.clear(resume)
  })

  it("returns null for an unknown key", function(resume) { with(this) {
    store.get("/nope").then(function(result) {
      resume(function() { assertEqual(null, result) })
    })
  }})

  it("stores and retrieves a document", function(resume) { with(this) {
    store.put("/foo", { hello: "world" }).then(function() {
      return store.get("/foo")
    }).then(function(result) {
      resume(function() { assertEqual({ hello: "world" }, result) })
    })
  }})

  it("retrieves a document when instantiated with master keys in place", function(resume) { with(this) {
    store.put("/foo", { hello: "world" }).then(function() {
      store = createStore()
      return store.get("/foo")
    }).then(function(result) {
      resume(function() { assertEqual({ hello: "world" }, result) })
    })
  }})

  it("concurrently writes to a bucket without losing updates", function(resume) { with(this) {
    assertRespondTo(MasterKeys.prototype, "hashPathname")
    stub(MasterKeys.prototype, "hashPathname").returns("0")

    Promise.all([
      store.put("/foo", { a: 1 }),
      store.put("/bar", { b: 2 })
    ]).then(function() {
      return Promise.all(["/foo", "/bar"].map(store.get, store))
    }).then(function(results) {
      resume(function() { assertEqual([{ a: 1 }, { b: 2 }], results) })
    })
  }})

  it("stores a document as a child of its parent directory", function(resume) { with(this) {
    Promise.all([
      store.put("/foo", { a: 1 }),
      store.put("/bar/qux", { b: 2 })
    ]).then(function() {
      return Promise.all(["/", "/bar/"].map(store.entries, store))
    }).then(function(results) {
      resume(function() { assertEqual([["bar/", "foo"], ["qux"]], results) })
    })
  }})

  it("does not store directory files more than once", function(resume) { with(this) {
    Promise.all([
      store.put("/bar/foo", { a: 1 }),
      store.put("/bar/qux", { b: 2 })
    ]).then(function() {
      return store.entries("/")
    }).then(function(entries) {
      resume(function() { assertEqual(["bar/"], entries) })
    })
  }})

  it("stores entries for nested directories", function(resume) { with(this) {
    store.put("/a/nested/directory/foo", { a: 1 }).then(function() {
      return Promise.all(
        ["/", "/a/", "/a/nested/", "/a/nested/directory/"].map(store.entries, store)
      )
    }).then(function(results) {
      resume(function() {
        assertEqual([["a/"], ["nested/"], ["directory/"], ["foo"]], results)
      })
    })
  }})

  it("finds entries for a directory recursively", function(resume) { with(this) {
    Promise.all([
      store.put("/foo/a", { a: 1 }),
      store.put("/foo/b", { b: 2 }),
      store.put("/foo/a/c", { c: 3 }),
      store.put("/bar/a", { a: 1 })
    ]).then(function() {
      return store.findRecursive("/foo/")
    }).then(function(entries) {
      resume(function() { assertEqual(["a", "a/c", "b"], entries) })
    })
  }})

  it("deletes a document", function(resume) { with(this) {
    store.put("/foo", { hello: "world" }).then(function() {
      return store.remove("/foo")
    }).then(function() {
      return store.get("/foo")
    }).then(function(result) {
      resume(function() { assertEqual(null, result) })
    })
  }})

  it("deletes a directory entry", function(resume) { with(this) {
    store.put("/foo", { hello: "world" }).then(function() {
      return store.remove("/foo")
    }).then(function() {
      return store.entries("/")
    }).then(function(result) {
      resume(function() { assertEqual([], result) })
    })
  }})

  it("deletes empty ancestor directories", function(resume) { with(this) {
    store.put("/a/nested/directory/foo", { a: 1 }).then(function() {
      return store.remove("/a/nested/directory/foo")
    }).then(function() {
      return Promise.all(
        ["/", "/a/", "/a/nested/", "/a/nested/directory/"].map(store.entries, store)
      )
    }).then(function(results) {
      resume(function() { assertEqual([[], [], [], []], results) })
    })
  }})

  it("does not delete non-empty ancestor directories", function(resume) { with(this) {
    Promise.all([
      store.put("/a/nested/directory/foo", { a: 1 }),
      store.put("/a/bar", { b: 2 })
    ]).then(function() {
      return store.remove("/a/nested/directory/foo")
    }).then(function() {
      return Promise.all(
        ["/", "/a/", "/a/nested/", "/a/nested/directory/"].map(store.entries, store)
      )
    }).then(function(results) {
      resume(function() { assertEqual([["a/"], ["bar"], [], []], results) })
    })
  }})

  it("removes a directory recursively", function(resume) { with(this) {
    Promise.all([
      store.put("/foo/a/nested/doc", { a: 1 }),
      store.put("/foo/b", { b: 2 }),
      store.put("/bar/c", { c: 3 })
    ]).then(function() {
      return store.removeRecursive("/foo/")
    }).then(function() {
      return Promise.all(
        ["/", "/foo/", "/foo/a/", "/foo/a/nested/"].map(store.entries, store)
      )
    }).then(function(results) {
      resume(function() { assertEqual([["bar/"], [], [] ,[]], results) })
    })
  }})
}})
