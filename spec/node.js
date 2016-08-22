var jstest = require("jstest").Test

require("./tests/store_spec")
require("./tests/util/binary_search_spec")

require("./tests/util/request/node_request_spec")

jstest.autorun()
