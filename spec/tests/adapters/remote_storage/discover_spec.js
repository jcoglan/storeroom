var discover = require("../../../../lib/adapters/remote_storage/discover"),
    http     = require("../../../../lib/util/http"),
    Buffer   = require("../../../../").Buffer,
    Promise  = require("../../../../").Promise,
    jstest   = require("jstest").Test

jstest.describe("RemoteStorage discovery", function() { with(this) {
  before(function() { with(this) {
    stub(http, "get").returns(Promise.resolve({status: 404}))
  }})

  this.define("stubGet", function(url, params, response) {
    var stub = params
             ? this.stub(http, "get").given(url, params)
             : this.stub(http, "get").given(url)
         
    stub.returns(Promise.resolve({
      status:  response[0],
      headers: response[1],
      body:    new Buffer(JSON.stringify(response[2]))
    }))
  })

  it("returns an error if nothing responds", function(resume) { with(this) {
    discover.withAddress("bob@example.com").catch(function(error) {
      resume(function() { assert(error) })
    })
  }})

  describe("with a non-200 status", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        201,
        {},
        {
          "links": [{
            "href": "https://example.com/store",
            "rel": "http://tools.ietf.org/id/draft-dejong-remotestorage",
            "properties": {
              "http://remotestorage.io/spec/version": "draft-dejong-remotestorage-05",
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("returns an error", function(resume) { with(this) {
      discover.withAddress("bob@example.com").catch(function(error) {
        resume(function() { assert(error) })
      })
    }})
  }})

  describe("with an unknown rel value", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            "href": "https://example.com/store",
            "rel": "http://tools.ietf.org/id/nope",
            "properties": {
              "http://remotestorage.io/spec/version": "draft-dejong-remotestorage-05",
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("returns an error", function(resume) { with(this) {
      discover.withAddress("bob@example.com").catch(function(error) {
        resume(function() { assert(error) })
      })
    }})
  }})

  describe("with an unrecognised version key", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            "href": "https://example.com/store",
            "rel": "http://tools.ietf.org/id/draft-dejong-remotestorage",
            "properties": {
              "http://remotestorage.io/spec/unknown": "draft-dejong-remotestorage-05",
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("returns an error", function(resume) { with(this) {
      discover.withAddress("bob@example.com").catch(function(error) {
        resume(function() { assert(error) })
      })
    }})
  }})

  describe("with an unrecognised auth key", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            "href": "https://example.com/store",
            "rel": "http://tools.ietf.org/id/draft-dejong-remotestorage",
            "properties": {
              "http://remotestorage.io/spec/version": "draft-dejong-remotestorage-05",
              "http://tools.ietf.org/html/rfc6749#section-4.1": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("returns an error", function(resume) { with(this) {
      discover.withAddress("bob@example.com").catch(function(error) {
        resume(function() { assert(error) })
      })
    }})
  }})


  describe("with an unrecognised storage key", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            "url": "https://example.com/store",
            "rel": "http://tools.ietf.org/id/draft-dejong-remotestorage",
            "properties": {
              "http://remotestorage.io/spec/version": "draft-dejong-remotestorage-05",
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("returns an error", function(resume) { with(this) {
      discover.withAddress("bob@example.com").catch(function(error) {
        resume(function() { assert(error) })
      })
    }})
  }})

  describe("with version draft-dejong-05", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            "href": "https://example.com/store",
            "rel": "http://tools.ietf.org/id/draft-dejong-remotestorage",
            "properties": {
              "http://remotestorage.io/spec/version": "draft-dejong-remotestorage-05",
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("discovers the storage", function(resume) { with(this) {
      discover.withAddress("bob@example.com").then(function(response) {
        resume(function() {
          assertEqual({
            version:     "draft-dejong-remotestorage-05",
            authDialog:  "https://example.com/auth",
            storageRoot: "https://example.com/store"
          }, response)
        })
      })
    }})
  }})

  describe("with version draft-dejong-02", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            "href": "https://example.com/store",
            "rel": "remotestorage",
            "properties": {
              "http://remotestorage.io/spec/version": "draft-dejong-remotestorage-02",
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("discovers the storage", function(resume) { with(this) {
      discover.withAddress("bob@example.com").then(function(response) {
        resume(function() {
          assertEqual({
            version:     "draft-dejong-remotestorage-02",
            authDialog:  "https://example.com/auth",
            storageRoot: "https://example.com/store"
          }, response)
        })
      })
    }})
  }})

  describe("with version draft-dejong-01", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            href: "https://example.com/store",
            rel: "remotestorage",
            type: "draft-dejong-remotestorage-01",
            properties: {
              "http://tools.ietf.org/html/rfc6749#section-4.2": "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("discovers the storage", function(resume) { with(this) {
      discover.withAddress("bob@example.com").then(function(response) {
        resume(function() {
          assertEqual({
            version:     "draft-dejong-remotestorage-01",
            authDialog:  "https://example.com/auth",
            storageRoot: "https://example.com/store"
          }, response)
        })
      })
    }})
  }})

  describe("with version draft-dejong-00", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/webfinger", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            href: "https://example.com/store",
            rel: "remotestorage",
            type: "draft-dejong-remotestorage-00",
            properties: {
              'auth-method': "http://tools.ietf.org/html/rfc6749#section-4.2",
              'auth-endpoint': "https://example.com/auth"
            }
          }]
        }
      ])
    }})

    it("discovers the storage", function(resume) { with(this) {
      discover.withAddress("bob@example.com").then(function(response) {
        resume(function() {
          assertEqual({
            version:     "draft-dejong-remotestorage-00",
            authDialog:  "https://example.com/auth",
            storageRoot: "https://example.com/store"
          }, response)
        })
      })
    }})
  }})

  describe("with version 2012.04", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/host-meta.json", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            href: 'https://example.com/storage/bob',
            rel: "remoteStorage",
            type: "https://www.w3.org/community/rww/wiki/read-write-web-00#simple",
            properties: {
              'auth-method': "https://tools.ietf.org/html/draft-ietf-oauth-v2-26#section-4.2",
              'auth-endpoint': 'https://example.com/auth/bob'
            }
          }]
        }
      ])
    }})

    it("discovers the storage", function(resume) { with(this) {
      discover.withAddress("bob@example.com").then(function(response) {
        resume(function() {
          assertEqual({
            version:     "https://www.w3.org/community/rww/wiki/read-write-web-00#simple",
            authDialog:  "https://example.com/auth/bob",
            storageRoot: "https://example.com/storage/bob"
          }, response)
        })
      })
    }})
  }})

  describe("with version 2011.10", function() { with(this) {
    before(function() { with(this) {
      stubGet("https://example.com/.well-known/host-meta.json", {resource: "acct:bob@example.com"}, [
        200,
        {},
        {
          "links": [{
            rel: "lrdd",
            template: "https://example.com/webfinger/jrd?resource={uri}"
          }]
        }
      ])

      stubGet("https://example.com/webfinger/jrd?resource=acct%3Abob%40example.com", null, [
        200,
        {},
        {
          "links": [{
            rel: "remoteStorage",
            api: "simple",
            auth: "https://example.com/oauth/bob",
            template: "https://example.com/storage/bob/{category}"
          }]
        }
      ])
    }})

    it("discovers the storage", function(resume) { with(this) {
      discover.withAddress("bob@example.com").then(function(response) {
        resume(function() {
          assertEqual({
            version:     "remoteStorage-2011.10",
            authDialog:  "https://example.com/oauth/bob",
            storageRoot: "https://example.com/storage/bob"
          }, response)
        })
      })
    }})
  }})
}})
