var binarySearch = require("../../../lib/util/binary_search"),
    jstest       = require("jstest").Test

jstest.describe("binarySearch", function() { with(this) {
  this.define("rand", function(n) {
    return Math.floor(Math.random() * n)
  })

  this.define("randomList", function() {
    var n = this.rand(100) + 1,
        x = this.rand(100),
        l = []

    while (n--) {
      l.push(x)
      x += 1 + this.rand(10)
    }
    return l
  })

  it("locates an existing element in a list", function() { with(this) {
    var list, index, value, result, message

    for (var i = 0; i < 100; i++) {
      list  = randomList()
      index = rand(list.length)
      value = list[index]

      result  = binarySearch(list, value)
      message = "binarySearch(" + JSON.stringify(list) + ", " + value + ") -> " + result

      assertEqual( index, result, message )
    }
  }})

  it("locates an existing element at the start of a list", function() { with(this) {
    var list

    for (var i = 0; i < 100; i++) {
      list = randomList()
      assertEqual( 0, binarySearch(list, list[0]) )
    }
  }})

  it("locates an existing element at the end of a list", function() { with(this) {
    var list

    for (var i = 0; i < 100; i++) {
      list = randomList()
      assertEqual( list.length - 1, binarySearch(list, list[list.length - 1]) )
    }
  }})

  it("locates a missing element in a list", function() { with(this) {
    var list, index, value, result, message

    for (var i = 0; i < 100; i++) {
      list  = randomList()
      index = rand(list.length)
      value = list.splice(index, 1)[0]

      result  = binarySearch(list, value)
      message = "binarySearch(" + JSON.stringify(list) + ", " + value + ") -> " + result

      assertEqual( -1 - index, result, message )
    }
  }})

  it("locates a missing element at the start of a list", function() { with(this) {
    var list, value

    for (var i = 0; i < 100; i++) {
      list  = randomList()
      value = list.shift()

      assertEqual( -1, binarySearch(list, value) )
    }
  }})

  it("locates a missing element at the end of a list", function() { with(this) {
    var list, value

    for (var i = 0; i < 100; i++) {
      list  = randomList()
      value = list.pop()

      assertEqual( -1 - list.length, binarySearch(list, value) )
    }
  }})

  it("locates a missing element in the empty list", function() { with(this) {
    assertEqual( -1, binarySearch([], rand(100)) )
  }})
}})
