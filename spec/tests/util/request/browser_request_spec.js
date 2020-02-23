var request = require("../../../../lib/util/request"),
    Buffer  = require("../../../../").Buffer,
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
    return { open: function() {}, send: function() {} }
  })

  before(function() { with(this) {
    this.req = stubRequest()
    stub("new", "XMLHttpRequest").returns(req)
  }})

  describe("requests", function() { with(this) {
    it("makes an HTTP GET request", function() { with(this) {
      expect(req, "open").given("GET", "http://example.com/", true)
      expect(req, "send").given("")

      request("GET", "http://example.com/")
    }})

    it("makes an HTTPS GET request", function() { with(this) {
      expect(req, "open").given("GET", "https://example.com/", true)
      expect(req, "send").given("")

      request("GET", "https://example.com/")
    }})

    it("makes an HTTP GET request with a port", function() { with(this) {
      expect(req, "open").given("GET", "http://example.com:3000/", true)
      expect(req, "send").given("")

      request("GET", "http://example.com:3000/")
    }})

    it("makes an HTTP GET request with parameters", function() { with(this) {
      expect(req, "open").given("GET", "http://example.com/search?q=I%20was%20there&n=20", true)
      expect(req, "send").given("")

      request("GET", "http://example.com/search", { q: "I was there", n: 20 })
    }})

    it("makes an HTTP GET request with parameters and a query string", function() { with(this) {
      expect(req, "open").given("GET", "http://example.com/search?hello=world&q=I%20was%20there&n=20", true)
      expect(req, "send").given("")

      request("GET", "http://example.com/search?hello=world", { q: "I was there", n: 20 })
    }})

    it("makes an HTTP DELETE request with parameters", function() { with(this) {
      expect(req, "open").given("DELETE", "http://example.com/search?q=I%20was%20there&n=20", true)
      expect(req, "send").given("")

      request("DELETE", "http://example.com/search", { q: "I was there", n: 20 })
    }})

    it("makes an HTTP POST request with parameters", function() { with(this) {
      expect(req, "open").given("POST", "http://example.com/search", true)
      expect(req, "setRequestHeader").given("Content-Type", "application/x-www-form-urlencoded")
      expect(req, "send").given("q=I%20was%20there&n=20")

      request("POST", "http://example.com/search", { q: "I was there", n: 20 })
    }})

    it("makes an HTTP PUT request with parameters", function() { with(this) {
      expect(req, "open").given("PUT", "http://example.com/search", true)
      expect(req, "setRequestHeader").given("Content-Type", "application/x-www-form-urlencoded")
      expect(req, "send").given("q=I%20was%20there&n=20")

      request("PUT", "http://example.com/search", { q: "I was there", n: 20 })
    }})

    it("makes an HTTP PUT request with a body", function() { with(this) {
      expect(req, "open").given("PUT", "http://example.com/search", true)
      expect(req, "setRequestHeader").given("Content-Type", "application/octet-stream")
      expect(req, "send").given("I was there")

      request("PUT", "http://example.com/search", "I was there")
    }})

    it("makes an HTTP PUT request with a body and content-type", function() { with(this) {
      expect(req, "open").given("PUT", "http://example.com/search", true)
      expect(req, "setRequestHeader").given("Content-Type", "text/plain")
      expect(req, "send").given("I was there")

      request("PUT", "http://example.com/search", "I was there", { "Content-Type": "text/plain" })
    }})
  }})

  describe("responses", function() { with(this) {
    this.define("respond", function() { with(this) {
      req.status       = status
      req.responseText = body.join("")

      var head = Object.keys(headers || {}).map(function(key) {
        var value = headers[key]
        stub(req, "getResponseHeader").given(key).returns(value)
        return key + ': ' + value
      }).join('\n') + '\n'

      stub(req, "getAllResponseHeaders").returns(head)

      req.onload()
    }})

    before(function(resume) { with(this) {
      this.res = this.err = null

      request("GET", "http://example.com/").then(function(response) {
        res = response
      }, function(error) {
        err = error
      }).then(function() { resume() })

      if (error) req.onerror(error)
      else respond()
    }})

    itShouldBehaveLike("HTTP response")
  }})
}})
