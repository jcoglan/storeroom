var parsePath = require("../../../lib/util/parse_path"),
    jstest    = require("jstest").Test

jstest.describe("parsePath", function() { with(this) {
  it("splits a path into its constituent pieces", function() { with(this) {
    assertEqual( [ {filename: "/",       pathname: "/"},
                   {filename: "foo/",    pathname: "/foo/"},
                   {filename: "bar.txt", pathname: "/foo/bar.txt"} ],
                 parsePath("/foo/bar.txt") )
  }})

  it("works if you omit the leading slash", function() { with(this) {
    assertEqual( [ {filename: "/",       pathname: "/"},
                   {filename: "foo/",    pathname: "/foo/"},
                   {filename: "bar.txt", pathname: "/foo/bar.txt"} ],
                 parsePath("foo/bar.txt") )
  }})

  it("parses a directory name", function() { with(this) {
    assertEqual( [ {filename: "/",       pathname: "/"},
                   {filename: "users/",  pathname: "/users/"},
                   {filename: "active/", pathname: "/users/active/"} ],
                 parsePath("/users/active/") )
  }})

  it("parses the root directory", function() { with(this) {
    assertEqual( [{filename: "/", pathname: "/"}], parsePath("/") )
  }})

  it("parses the empty string", function() { with(this) {
    assertEqual( [{filename: "/", pathname: "/"}], parsePath("") )
  }})
}})
