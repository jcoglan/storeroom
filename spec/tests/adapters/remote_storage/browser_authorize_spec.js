var storeroom = require("../../../../"),
    discover  = require("../../../../lib/adapters/remote_storage/discover"),
    oauth     = require("../../../../lib/util/oauth"),
    Promise   = storeroom.Promise,
    jstest    = require("jstest").Test

jstest.describe("RemoteStorage browser authorization", function() { with(this) {
  before(function() { with(this) {
    this.discoverResponse = {
      version:     "draft-dejong-remotestorage-05",
      authDialog:  "https://auth.example.com/alice",
      storageRoot: "https://storage.example.com/alice"
    }
    stub(discover, "withAddress").returns(Promise.resolve(discoverResponse))

    this.oauthResponse = { access_token: "deadbeef" }
    stub(oauth, "openWindow").returns(Promise.resolve(oauthResponse))

    this.params = {
      address:  "alice@example.com",
      client:   "Storeroom Test",
      callback: "http://example.com/callback",
      scope:    "storeroom-test"
    }
  }})

  it("discovers the storage", function(resume) { with(this) {
    expect(discover, "withAddress").given("alice@example.com").returning(Promise.resolve(discoverResponse))
    storeroom.connectRemoteStorage(params).then(function() { resume() })
  }})

  it("opens an OAuth window", function(resume) { with(this) {
    expect(oauth, "openWindow").given("https://auth.example.com/alice", {
      client_id:     "Storeroom Test",
      redirect_uri:  "http://example.com/callback",
      response_type: "token",
      scope:         "storeroom-test:rw"
    }, {
      width:  instanceOf("number"),
      height: instanceOf("number")

    }).returning(Promise.resolve(oauthResponse))

    storeroom.connectRemoteStorage(params).then(function() { resume() })
  }})

  it("returns the session credentials", function(resume) { with(this) {
    storeroom.connectRemoteStorage(params).then(function(response) {
      resume(function() {
        assertEqual({
          address:       "alice@example.com",
          scope:         "storeroom-test",
          webfinger:     discoverResponse,
          authorization: oauthResponse
        }, response)
      })
    })
  }})

  describe("when discovery fails", function() { with(this) {
    before(function() { with(this) {
      stub(discover, "withAddress").returns(Promise.reject(new Error("Invalid address")))
    }})

    it("does not start the OAuth flow", function(resume) { with(this) {
      expect(oauth, "openWindow").exactly(0)
      storeroom.connectRemoteStorage(params).catch(function() { resume() })
    }})

    it("returns the error", function(resume) { with(this) {
      storeroom.connectRemoteStorage(params).catch(function(error) {
        resume(function() { assertEqual("Invalid address", error.message) })
      })
    }})
  }})

  describe("when OAuth fails", function() { with(this) {
    before(function() { with(this) {
      stub(oauth, "openWindow").returns(Promise.reject(new Error("Access denied")))
    }})

    it("returns the error", function(resume) { with(this) {
      storeroom.connectRemoteStorage(params).catch(function(error) {
        resume(function() { assertEqual("Access denied", error.message) })
      })
    }})
  }})
}})
