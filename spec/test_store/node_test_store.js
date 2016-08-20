"use strict";

var path      = require("path"),
    rm_rf     = require("rimraf"),
    storeroom = require("../../")

var storepath = path.resolve(__dirname, "_tmp")

module.exports = {
  create: function() {
    return storeroom.createFileAdapter(storepath)
  },

  clear: function(callback) {
    rm_rf(storepath, callback)
  }
}
