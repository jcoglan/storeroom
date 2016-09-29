var storeroom = require("../../../../"),
    http      = require("../../../../lib/util/http"),
    oauth     = require("../../../../lib/util/oauth"),
    Promise   = storeroom.Promise,
    jstest    = require("jstest").Test

jstest.describe("Dropbox authorization", function() { with(this) {
  before(function() { with(this) {
    this.params = {
      key:      "deadbeef",
      callback: "http://example.com/callback"
    }
  }})

  describe("token flow", function() { with(this) {
    before(function() { with(this) {
      this.oauthResponse = {access_token: "bearer-token"}
      stub(oauth, "openWindow").returns(Promise.resolve(oauthResponse))
    }})

    it("opens an OAuth window", function(resume) { with(this) {
      expect(oauth, "openWindow").given("https://www.dropbox.com/1/oauth2/authorize", {
        client_id:     "deadbeef",
        redirect_uri:  "http://example.com/callback",
        response_type: "token"
      }, {
        width:  instanceOf("number"),
        height: instanceOf("number")

      }).returning(Promise.resolve(oauthResponse))

      storeroom.connectDropbox(params).then(function() { resume() })
    }})

    it("does not make an exchange request", function(resume) { with(this) {
      expect(http, "post").exactly(0)
      storeroom.connectDropbox(params).then(function() { resume() })
    }})

    it("returns the session credentials", function(resume) { with(this) {
      storeroom.connectDropbox(params).then(function(response) {
        resume(function() {
          assertEqual( {authorization: {access_token: "bearer-token"}}, response )
        })
      })
    }})

    it("throws an error on failure", function(resume) { with(this) {
      stub(oauth, "openWindow").returns(Promise.reject(new Error("Access denied")))

      storeroom.connectDropbox(params).catch(function(error) {
        resume(function() { assertEqual("Access denied", error.message) })
      })
    }})
  }})

  describe("code flow", function() { with(this) {
    before(function() { with(this) {
      stub(http, "post").returns(Promise.resolve({}))

      this.oauthResponse = {code: "the-authorization-code"}
      stub(oauth, "openWindow").returns(Promise.resolve(oauthResponse))

      params.type   = "code"
      params.secret = "the-secret"
    }})

    it("opens an OAuth window", function(resume) { with(this) {
      expect(oauth, "openWindow").given("https://www.dropbox.com/1/oauth2/authorize", {
        client_id:     "deadbeef",
        redirect_uri:  "http://example.com/callback",
        response_type: "code"
      }, {
        width:  instanceOf("number"),
        height: instanceOf("number")

      }).returning(Promise.resolve(oauthResponse))

      storeroom.connectDropbox(params).catch(function() { resume() })
    }})

    describe("when the OAuth window succeeds", function() { with(this) {
      before(function() { with(this) {
        stub(oauth, "openWindow").returns(Promise.resolve(oauthResponse))
      }})

      it("makes an exchange request", function(resume) { with(this) {
        expect(http, "post").given("https://www.dropbox.com/1/oauth2/token", {
          client_id:     "deadbeef",
          client_secret: "the-secret",
          redirect_uri:  "http://example.com/callback",
          grant_type:    "authorization_code",
          code:          "the-authorization-code"
        }).returning(Promise.resolve({}))

        storeroom.connectDropbox(params).catch(function() { resume() })
      }})

      it("returns the access token on success", function(resume) { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 200,
          body:   '{"access_token": "bearer token"}'
        }))

        storeroom.connectDropbox(params).then(function(response) {
          resume(function() {
            assertEqual({authorization: {access_token: "bearer token"}}, response)
          })
        })
      }})

      it("throws an error on failure", function(resume) { with(this) {
        stub(http, "post").returns(Promise.resolve({
          status: 401,
          body:   "Unauthorized"
        }))

        storeroom.connectDropbox(params).catch(function(error) {
          resume(function() {
            assertEqual("Dropbox error (401): Unauthorized", error.message)
          })
        })
      }})
    }})

    describe("when the OAuth window fails", function() { with(this) {
      before(function() { with(this) {
        stub(oauth, "openWindow").returns(Promise.reject(new Error("Access denied")))
      }})

      it("does not make an exchange request", function(resume) { with(this) {
        expect(http, "post").exactly(0)
        storeroom.connectDropbox(params).catch(function() { resume() })
      }})

      it("throws the error", function(resume) { with(this) {
        storeroom.connectDropbox(params).catch(function(error) {
          resume(function() { assertEqual("Access denied", error.message) })
        })
      }})
    }})
  }})
}})
