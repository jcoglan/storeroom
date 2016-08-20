"use strict";

var storeroom = require("../../")

module.exports = {
  create: function() {
    return storeroom.createLocalStorageAdapter("test")
  },

  clear: function(callback) {
    localStorage.clear()
    callback()
  }
}
