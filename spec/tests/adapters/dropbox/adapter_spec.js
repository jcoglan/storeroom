var storeroom = require("../../../../"),
    errors    = require("../../../../lib/adapters/errors"),
    http      = require("../../../../lib/util/http"),
    Promise   = storeroom.Promise,
    jstest    = require("jstest").Test

jstest.describe("DropboxAdapter", function() { with(this) {
  this.define("jsonIncluding", function(object) {
    var matcher = this.objectIncluding(object)
    return {
      equals: function(string) {
        return matcher.equals(JSON.parse(string))
      }
    }
  })

  before(function() { with(this) {
    this.adapter = storeroom.createDropboxAdapter({
      authorization: {access_token: "deadbeef"}
    })
  }})

  describe("read", function() { with(this) {
    it("downloads a file", function(resume) { with(this) {
      expect(http, "post").given("https://content.dropboxapi.com/2/files/download", {}, {
        "Authorization":   "Bearer deadbeef",
        "Content-Type":    " ",
        "Dropbox-API-Arg": jsonIncluding({path: "/a-file"})
      }).returning(Promise.resolve({}))

      adapter.read("a-file").catch(function() { resume() })
    }})

    describe("when the request is successful", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status:  200,
          headers: {"dropbox-api-result": "{}"},
          body:    "the file contents"
        }))
      }})

      it("returns the file contents", function(resume) { with(this) {
        adapter.read("a-file").then(function(result) {
          resume(function() { assertEqual("the file contents", result) })
        })
      }})
    }})

    describe("when the request is unauthorized", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status:  401,
          headers: {"dropbox-api-result": "{}"},
          body:    "Bad access token"
        }))
      }})

      it("throws an AuthError", function(resume) { with(this) {
        adapter.read("a-file").catch(function(error) {
          resume(function() {
            assertKindOf( errors.AuthError, error )
            assertEqual( "Dropbox error: Bad access token", error.message )
          })
        })
      }})
    }})

    describe("when the file is not found", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status:  409,
          headers: {"dropbox-api-result": "{}"},
          body:    '{"error": {"path": {".tag": "not_found"}}}'
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.read("a-file").then(function(result) {
          resume(function() { assertNull(result) })
        })
      }})
    }})

    describe("when an error is returned", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status:  409,
          headers: {"dropbox-api-result": "{}"},
          body:    '{"error": "Server error"}'
        }))
      }})

      it("throws the error", function(resume) { with(this) {
        adapter.read("a-file").catch(function(error) {
          resume(function() {
            assertEqual( 'Dropbox error (409): {"error": "Server error"}', error.message )
          })
        })
      }})
    }})
  }})

  describe("write", function() { with(this) {
    describe("before reading the file", function() { with(this) {
      it("adds a file", function(resume) { with(this) {
        expect(http, "post").given(
          "https://content.dropboxapi.com/2/files/upload",
          "the file contents", {
            "Authorization":   "Bearer deadbeef",
            "Content-Type":    "application/octet-stream",
            "Dropbox-API-Arg": jsonIncluding({path: "/a-file", mode: "add", autorename: false, mute: true})
          }).returning(Promise.resolve({}))

        adapter.write("a-file", "the file contents").catch(function() { resume() })
      }})
    }})

    describe("after adding the file", function() { with(this) {
      before(function(resume) { with(this) {
        stub(http, "post").given(match(/\/upload$/), anything(), objectIncluding({
          "Dropbox-API-Arg": jsonIncluding({mode: "add"})
        })).returns(Promise.resolve({
          status: 200,
          body:   '{"rev": "789xyz"}'
        }))

        adapter.write("a-file", "the file contents").then(function() { resume() })
      }})
      
      it("updates the file with the received etag", function(resume) { with(this) {
        expect(http, "post").given(
          "https://content.dropboxapi.com/2/files/upload",
          "the file contents", {
            "Authorization":   "Bearer deadbeef",
            "Content-Type":    "application/octet-stream",
            "Dropbox-API-Arg": jsonIncluding({path: "/a-file", mode: {".tag": "update", update: "789xyz"}})
          }).returning(Promise.resolve({}))

        adapter.write("a-file", "the file contents").catch(function() { resume() })
      }})
    }})

    describe("after reading the file", function() { with(this) {
      before(function(resume) { with(this) {
        stub(http, "post").given(match(/\/download$/), anyArgs())
          .returns(Promise.resolve({
            status:  200,
            headers: {"dropbox-api-result": '{"rev": "123abc"}'},
            body:    "the file contents"
          }))

        adapter.read("a-file").then(function() { resume() })
      }})
      
      it("updates the file", function(resume) { with(this) {
        expect(http, "post").given(
          "https://content.dropboxapi.com/2/files/upload",
          "the file contents", {
            "Authorization":   "Bearer deadbeef",
            "Content-Type":    "application/octet-stream",
            "Dropbox-API-Arg": jsonIncluding({path: "/a-file", mode: {".tag": "update", update: "123abc"}})
          }).returning(Promise.resolve({}))

        adapter.write("a-file", "the file contents").catch(function() { resume() })
      }})
    }})

    describe("when the request is successful", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 200,
          body:   '{"rev": "789xyz"}'
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").then(function(result) {
          resume(function() { assertNull(result) })
        })
      }})
    }})

    describe("when the request is unauthorized", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 401,
          body:   "Bad access token"
        }))
      }})

      it("throws an AuthError", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").catch(function(error) {
          resume(function() {
            assertKindOf( errors.AuthError, error )
            assertEqual( "Dropbox error: Bad access token", error.message )
          })
        })
      }})
    }})

    describe("when there is a conflict", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 409,
          body:   '{"error": {"reason": {".tag": "conflict"}}}'
        }))
      }})

      it("throws a ConflictError", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").catch(function(error) {
          resume(function() {
            assertKindOf( errors.ConflictError, error )
            assertEqual( 'Dropbox error: {"error": {"reason": {".tag": "conflict"}}}', error.message )
          })
        })
      }})
    }})

    describe("when an error is returned", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 409,
          body:   '{"error": "Server error"}'
        }))
      }})

      it("throws the error", function(resume) { with(this) {
        adapter.write("a-file", "the file contents").catch(function(error) {
          resume(function() {
            assertEqual( 'Dropbox error (409): {"error": "Server error"}', error.message )
          })
        })
      }})
    }})
  }})

  describe("deletion", function() { with(this) {
    it("deletes a file by writing null", function(resume) { with(this) {
      expect(http, "post").given(
        "https://api.dropboxapi.com/2/files/delete",
        jsonIncluding({path: "/a-file"}), {
          "Authorization": "Bearer deadbeef",
          "Content-Type":  "application/json",
        }).returning(Promise.resolve({}))

      adapter.write("a-file", null).catch(function() { resume() })
    }})

    describe("when the request is successful", function() { with(this) {
      before(function(resume) { with(this) {
        stub(http, "post").given(match(/\/download$/), anyArgs())
          .returns(Promise.resolve({
            status:  200,
            headers: {"dropbox-api-result": '{"rev": "123abc"}'},
            body:    "the file contents"
          }))

        stub(http, "post").given(match(/\/delete$/), anyArgs())
          .returns(Promise.resolve({status: 200, body: "{}"}))

        adapter.read("a-file").then(function() { resume() })
      }})

      it("removes the file's etag from memory", function(resume) { with(this) {
        expect(http, "post").given(match(/\/upload$/), "the new contents", objectIncluding({
          "Dropbox-API-Arg": jsonIncluding({path: "/a-file", mode: "add"})
        })).returning(Promise.resolve({}))

        adapter.write("a-file", null).then(function() {
          return adapter.write("a-file", "the new contents")
        }).catch(function(error) {
          resume()
        })
      }})

      it("returns null", function(resume) { with(this) {
        adapter.write("a-file", null).then(function(result) {
          resume(function() { assertNull(result) })
        })
      }})
    }})

    describe("when the request is unauthorized", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({status: 401, body: "{}"}))
      }})

      it("throws an AuthError", function(resume) { with(this) {
        adapter.write("a-file", null).catch(function(error) {
          resume(function() {
            assertKindOf( errors.AuthError, error )
            assertEqual( "Dropbox error: {}", error.message )
          })
        })
      }})
    }})

    describe("when the file is not found", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 409,
          body:   '{"error": {"path_lookup": {".tag": "not_found"}}}'
        }))
      }})

      it("returns null", function(resume) { with(this) {
        adapter.write("a-file", null).then(function(result) {
          resume(function() { assertNull(result) })
        })
      }})
    }})

    describe("when an error is returned", function() { with(this) {
      before(function() { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 409,
          body:   '{"error": "Gateway timeout"}'
        }))
      }})

      it("throws the error", function(resume) { with(this) {
        adapter.write("a-file", null).catch(function(error) {
          resume(function() {
            assertEqual( 'Dropbox error (409): {"error": "Gateway timeout"}', error.message )
          })
        })
      }})
    }})
  }})
}})
