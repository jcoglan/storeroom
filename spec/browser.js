var jstest = require("jstest").Test

require("./tests/store_spec")
require("./tests/util/binary_search_spec")
require("./tests/util/mutex_spec")
require("./tests/util/parse_path_spec")
require("./tests/util/querystring_spec")
require("./tests/adapters/adapter_examples")
require("./tests/adapters/dropbox_spec")
require("./tests/adapters/local_storage_spec")
require("./tests/adapters/remote_storage/browser_authorize_spec")
require("./tests/adapters/remote_storage/discover_spec")

require("./tests/util/request/browser_request_spec")

jstest.autorun()
