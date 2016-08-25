var request = require("../../../../lib/util/request"),
    http    = require("http"),
    https   = require("https"),
    stream  = require("stream"),
    util    = require("util"),
    jstest  = require("jstest").Test

require("./http_response")

jstest.describe("request", function() { with(this) {
  this.define("buffer", function(string) {
    return {
      equals: function(buffer) {
        return buffer instanceof Buffer && buffer.toString() === string
      }
    }
  })

  this.define("stubRequest", function() {
    return new stream.Writable()
  })

  before(function() { with(this) {
    stub(http, "request").returns(stubRequest())
    stub(https, "request").returns(stubRequest())
  }})

  describe("requests", function() { with(this) {
    it("makes an HTTP GET request", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "GET",
        host:    "example.com",
        port:    80,
        path:    "/",
        headers: {}
      }).returning(req)

      expect(req, "end").exactly(1)
      request("GET", "http://example.com/")
    }})

    it("makes an HTTPS GET request", function() { with(this) {
      var req = stubRequest()

      expect(https, "request").given({
        method:  "GET",
        host:    "example.com",
        port:    443,
        path:    "/",
        headers: {}
      }).returning(req)

      expect(req, "end").exactly(1)
      request("GET", "https://example.com/")
    }})

    it("makes an HTTP GET request with a port", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "GET",
        host:    "example.com",
        port:    3000,
        path:    "/",
        headers: {}
      }).returning(req)

      expect(req, "end").exactly(1)
      request("GET", "http://example.com:3000/")
    }})

    it("makes an HTTP GET request with parameters", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "GET",
        host:    "example.com",
        port:    80,
        path:    "/search?q=I%20was%20there&n=20",
        headers: {}
      }).returning(req)

      expect(req, "write").exactly(0)

      expect(req, "end").exactly(1)
      request("GET", "http://example.com/search", {q: "I was there", n: 20})
    }})

    it("makes an HTTP GET request with parameters and a query string", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "GET",
        host:    "example.com",
        port:    80,
        path:    "/search?hello=world&q=I%20was%20there&n=20",
        headers: {}
      }).returning(req)

      expect(req, "write").exactly(0)

      expect(req, "end").exactly(1)
      request("GET", "http://example.com/search?hello=world", {q: "I was there", n: 20})
    }})

    it("makes an HTTP DELETE request with parameters", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "DELETE",
        host:    "example.com",
        port:    80,
        path:    "/search?q=I%20was%20there&n=20",
        headers: {
          "Content-Length": "0"
        }
      }).returning(req)

      expect(req, "write").exactly(0)

      expect(req, "end").exactly(1)
      request("DELETE", "http://example.com/search", {q: "I was there", n: 20})
    }})

    it("makes an HTTP POST request with parameters", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "POST",
        host:    "example.com",
        port:    80,
        path:    "/search",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": "22"
        }
      }).returning(req)

      expect(req, "write").given(buffer("q=I%20was%20there&n=20"))

      expect(req, "end").exactly(1)
      request("POST", "http://example.com/search", {q: "I was there", n: 20})
    }})

    it("makes an HTTP PUT request with parameters", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "PUT",
        host:    "example.com",
        port:    80,
        path:    "/search",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": "22"
        }
      }).returning(req)

      expect(req, "write").given(buffer("q=I%20was%20there&n=20"))

      expect(req, "end").exactly(1)
      request("PUT", "http://example.com/search", {q: "I was there", n: 20})
    }})

    it("makes an HTTP PUT request with a body", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "PUT",
        host:    "example.com",
        port:    80,
        path:    "/search",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": "11"
        }
      }).returning(req)

      expect(req, "write").given(buffer("I was there"))

      expect(req, "end").exactly(1)
      request("PUT", "http://example.com/search", "I was there")
    }})

    it("makes an HTTP PUT request with a body and content-type", function() { with(this) {
      var req = stubRequest()

      expect(http, "request").given({
        method:  "PUT",
        host:    "example.com",
        port:    80,
        path:    "/search",
        headers: {
          "content-type": "text/plain",
          "Content-Length": "11"
        }
      }).returning(req)

      expect(req, "write").given(buffer("I was there"))

      expect(req, "end").exactly(1)
      request("PUT", "http://example.com/search", "I was there", {"content-type": "text/plain"})
    }})
  }})

  describe("responses", function() { with(this) {
    var Response = function(status, headers, body) {
      stream.Readable.call(this)

      this.statusCode = status
      this.headers    = headers
      this._parts     = body
    }
    util.inherits(Response, stream.Readable)

    Response.prototype._read = function() {
      var part = this._parts.shift() || null
      this.push(part)
    }

    this.define("status",  200)
    this.define("headers", {})
    this.define("body",    [])
    this.define("error",   null)

    this.define("doRequest", function(url, resume) { with(this) {
      this.res = this.err = null

      request("GET", url).then(function(response) {
        res = response
      }, function(error) {
        err = error
      }).then(function() { resume() })
    }})

    before(function(resume) { with(this) {
      this.req = stubRequest()
      stub(http, "request").returns(req)

      doRequest("http://example.com/", resume)

      if (error)
        req.emit("error", error)
      else
        req.emit("response", new Response(status, headers, body))
    }})

    itShouldBehaveLike("HTTP response")

    describe("with an absolute redirect", function() { with(this) {
      before(function(resume) { with(this) {
        var redirect = stubRequest(), target = stubRequest()

        stub(http, "request").given(objectIncluding({host: "example.com"})).returns(redirect)
        stub(http, "request").given(objectIncluding({host: "google.com"})).returns(target)

        doRequest("http://example.com/", resume)

        redirect.emit("response", new Response(302, {"location": "http://google.com/"}, ["You are being redirected"]))
        target.emit("response", new Response(201, {}, ["Google.com"]))
      }})

      it("follows the redirect", function() { with(this) {
        assertEqual( buffer("Google.com"), res.body )
      }})
    }})

    describe("with a host-relative redirect", function() { with(this) {
      before(function(resume) { with(this) {
        var redirect = stubRequest(), target = stubRequest()

        stub(http, "request").given(objectIncluding({path: "/users/jcoglan"})).returns(redirect)
        stub(http, "request").given(objectIncluding({path: "/about"})).returns(target)

        doRequest("http://example.com/users/jcoglan", resume)

        redirect.emit("response", new Response(302, {"location": "/about"}, ["You are being redirected"]))
        target.emit("response", new Response(201, {}, ["About"]))
      }})

      it("follows the redirect", function() { with(this) {
        assertEqual( buffer("About"), res.body )
      }})
    }})

    describe("with a path-relative redirect", function() { with(this) {
      before(function(resume) { with(this) {
        var redirect = stubRequest(), target = stubRequest()

        stub(http, "request").given(objectIncluding({path: "/users/jcoglan"})).returns(redirect)
        stub(http, "request").given(objectIncluding({path: "/users/about"})).returns(target)

        doRequest("http://example.com/users/jcoglan", resume)

        redirect.emit("response", new Response(302, {"location": "about"}, ["You are being redirected"]))
        target.emit("response", new Response(201, {}, ["About"]))
      }})

      it("follows the redirect", function() { with(this) {
        assertEqual( buffer("About"), res.body )
      }})
    }})
  }})
}})
