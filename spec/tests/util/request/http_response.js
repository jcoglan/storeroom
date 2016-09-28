var jstest = require("jstest").Test

jstest.describe("responses", function() { with(this) {
  sharedBehavior("HTTP response", function() { with(this) {
    this.define("status",  200)
    this.define("headers", {})
    this.define("body",    [])
    this.define("error",   null)

    it("returns the status code", function() { with(this) {
      assertEqual( 200, res.status )
    }})

    describe("with an error code", function() { with(this) {
      this.define("status", 404)

      it("returns the status code", function() { with(this) {
        assertEqual( 404, res.status )
      }})
    }})

    describe("with a response body", function() { with(this) {
      this.define("headers", {"content-type": "application/json"})
      this.define("body",    ['{"st', 'atus', '":"ok"', '}'])

      it("returns the content-type", function() { with(this) {
        assertEqual( "application/json", res.headers["content-type"] )
      }})

      it("buffers the body", function() { with(this) {
        assertEqual( buffer('{"status":"ok"}'), res.body )
      }})
    }})

    describe("with an error", function() { with(this) {
      this.define("error", new Error("Request error"))

      it("returns the error", function() { with(this) {
        assertNull( res )
        assertEqual( "Request error", err.message )
      }})
    }})
  }})
}})
