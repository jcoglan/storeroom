var jstest = require("jstest").Test

require("./tests/store_spec")
require("./tests/util/binary_search_spec")
require("./tests/util/mutex_spec")

require("./tests/util/request/browser_request_spec")

jstest.autorun()
