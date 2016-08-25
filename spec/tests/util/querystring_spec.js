var qs     = require("../../../lib/util/querystring"),
    jstest = require("jstest").Test

jstest.describe("querystring", function() { with(this) {
  it("serialises data", function() { with(this) {
    assertEqual( "search%20term=black%20%26%20white&n=16",
                 qs.stringify({"search term": "black & white", n: 16}) )
  }})

  it("parses a string", function() { with(this) {
    assertEqual( {"search term": "black & white", n: "16"},
                 qs.parse("search%20term=black%20%26%20white&n=16") )
  }})
}})
