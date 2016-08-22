var request = require("../../../../lib/util/request"),
    http    = require("http"),
    https   = require("https"),
    stream  = require("stream"),
    jstest  = require("jstest").Test

jstest.describe("request", function() { with(this) {
  this.define("buffer", function(string) {
    return {
      equals: function(buffer) {
        return buffer.toString() === string
      }
    }
  })

  this.define("clientRequest", function() {
    return new stream.Writable()
  })

  before(function() { with(this) {
    stub(http, "request").returns(clientRequest())
    stub(https, "request").returns(clientRequest())
  }})

  it("makes an HTTP GET request", function() { with(this) {
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
    var req = clientRequest()

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
