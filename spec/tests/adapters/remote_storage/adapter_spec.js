var storeroom = require("../../../../"),
    Buffer    = storeroom.Buffer,
    errors    = require("../../../../lib/adapters/errors"),
    http      = require("../../../../lib/util/http"),
    Promise   = storeroom.Promise,
    jstest    = require("jstest").Test

jstest.describe("RemoteStorageAdapter", function() { with(this) {
  before(function() { with(this) {
    this.adapter = storeroom.createRemoteStorageAdapter({
      address:        "alice@example.com",
      scope:          "passwords",
      webfinger: {
        version:      "draft-dejong-remotestorage-05",
        authDialog:   "https://auth.example.com/alice",
        storageRoot:  "https://store.example.com/alice"
      },
      authorization: {
        access_token: "deadbeef"
      }
    })
  }})

  describe("read", function() { with(this) {
    it("requests a file", function(resume) { with(this) {
      expect(http, "get").given("https://store.example.com/alice/passwords/a-file", {}, {
        "Authorization": "Bearer deadbeef"
      }).returning(Promise.resolve({}))

      adapter.read("a-file").catch(function() { resume() })
    }})

    describe("when the request is successful", function() { with(this) {
      before(function() { with(this) {
        stub(http, "get").returns(Promise.resolve({
          status: 200,
          body:   Buffer.from("the file contents")
        }))
      }})

      it("returns the file contents", function(resume) { with(this) {
        adapter.read("a-file").then(function(response) {
          resume(function() { assertEqual("the file contents", response) })
        })
      }})
    }})

    describe("when the request is unauthorized", function() { with(this) {
      before(function() { with(this) {
        stub(http, "get").returns(Promise.resolve({
          status: 401,
          body:   Buffer.from("Access denied")
        }))
      }})

      it("throws an AuthError", function(resume) { with(this) {
        adapter.read("a-file").catch(function(error) {
          resume(function() {
            assertKindOf( errors.AuthError, error )
            assertEqual( "RemoteStorage error: Access denied", error.message )
          })
        })
      }})
    }})

    describe("when the file does not exist", function() { with(this) {
      before(function() { with(this) {
        stub(http, "get").returns(Promise.resolve({
          status: 404,
          body:   Buffer.from("Not found")
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.read("a-file").then(function(response) {
          resume(function() { assertNull(response) })
        })
      }})
    }})

    describe("when an error is returned", function() { with(this) {
      before(function() { with(this) {
        stub(http, "get").returns(Promise.resolve({
          status: 500,
          body:   Buffer.from("Server error")
        }))
      }})

      it("throws the error", function(resume) { with(this) {
        adapter.read("a-file").catch(function(error) {
          resume(function() {
            assertEqual( "RemoteStorage error (500): GET https://store.example.com/alice/passwords/a-file", error.message )
          })
        })
      }})
    }})
  }})

  describe("write", function() { with(this) {
    it("submits a file", function(resume) { with(this) {
      expect(http, "put").given("https://store.example.com/alice/passwords/a-file", "the file contents", {
        "Authorization": "Bearer deadbeef",
        "Content-Type":  "text/plain"
      }).returning(Promise.resolve({}))

      adapter.write("a-file", "the file contents").catch(function() { resume() })
    }})

    describe("when the request is successful", function() { with(this) {
      before(function() { with(this) {
        stub(http, "put").returns(Promise.resolve({
          status: 200,
          body:   Buffer.from("")
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").then(function(response) {
          resume(function() { assertNull(response) })
        })
      }})
    }})

    describe("when the request is unauthorized", function() { with(this) {
      before(function() { with(this) {
        stub(http, "put").returns(Promise.resolve({
          status: 401,
          body:   Buffer.from("Access denied")
        }))
      }})

      it("throws an AuthError", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").catch(function(error) {
          resume(function() {
            assertKindOf( errors.AuthError, error )
            assertEqual( "RemoteStorage error: Access denied", error.message )
          })
        })
      }})
    }})

    describe("when there is a conflict", function() { with(this) {
      before(function() { with(this) {
        stub(http, "put").returns(Promise.resolve({
          status: 412,
          body:   Buffer.from("Version mismatch")
        }))
      }})

      it("throws a ConflictError", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").catch(function(error) {
          resume(function() {
            assertKindOf( errors.ConflictError, error )
            assertEqual( "RemoteStorage error: Version mismatch", error.message )
          })
        })
      }})
    }})

    describe("when an error is returned", function() { with(this) {
      before(function() { with(this) {
        stub(http, "put").returns(Promise.resolve({
          status: 500,
          body:   Buffer.from("Server error")
        }))
      }})

      it("throws the error", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").catch(function(error) {
          resume(function() {
            assertEqual( "RemoteStorage error (500): PUT https://store.example.com/alice/passwords/a-file", error.message )
          })
        })
      }})
    }})
  }})

  describe("deletion", function() { with(this) {
    it("deletes a file", function(resume) { with(this) {
      expect(http, "del").given("https://store.example.com/alice/passwords/a-file", {}, {
        "Authorization": "Bearer deadbeef",
      }).returning(Promise.resolve({}))

      adapter.write("a-file", null).catch(function() { resume() })
    }})

    describe("when the request is successful", function() { with(this) {
      before(function() { with(this) {
        stub(http, "del").returns(Promise.resolve({
          status: 200,
          body:   Buffer.from("")
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.write("a-file", null).then(function(response) {
          resume(function() { assertNull(response) })
        })
      }})
    }})

    describe("when the file does not exist", function() { with(this) {
      before(function() { with(this) {
        stub(http, "del").returns(Promise.resolve({
          status: 404,
          body:   Buffer.from("")
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.write("a-file", null).then(function(response) {
          resume(function() { assertNull(response) })
        })
      }})
    }})

    describe("when the request is unauthorized", function() { with(this) {
      before(function() { with(this) {
        stub(http, "del").returns(Promise.resolve({
          status: 401,
          body:   Buffer.from("Access denied")
        }))
      }})

      it("throws an AuthError", function(resume) { with(this) {
        adapter.write("a-file", null).catch(function(error) {
          resume(function() {
            assertKindOf( errors.AuthError, error )
            assertEqual( "RemoteStorage error: Access denied", error.message )
          })
        })
      }})
    }})

    describe("when there is a conflict", function() { with(this) {
      before(function() { with(this) {
        stub(http, "del").returns(Promise.resolve({
          status: 409,
          body:   Buffer.from("Version mismatch")
        }))
      }})

      it("throws a ConflictError", function(resume) { with(this) {
        adapter.write("a-file", null).catch(function(error) {
          resume(function() {
            assertKindOf( errors.ConflictError, error )
            assertEqual( "RemoteStorage error: Version mismatch", error.message )
          })
        })
      }})
    }})

    describe("when an error is returned", function() { with(this) {
      before(function() { with(this) {
        stub(http, "del").returns(Promise.resolve({
          status: 500,
          body:   Buffer.from("Server error")
        }))
      }})

      it("throws the error", function(resume) { with(this) {
        adapter.write("a-file", null).catch(function(error) {
          resume(function() {
            assertEqual( "RemoteStorage error (500): DELETE https://store.example.com/alice/passwords/a-file", error.message )
          })
        })
      }})
    }})
  }})
}})
