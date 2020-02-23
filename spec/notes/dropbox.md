# Dropbox API

## Adding a file

With valid parameters:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": "add" }' \
        -d 'Hello world'

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "name": "hello.txt",
      "path_lower": "/hello.txt",
      "path_display": "/hello.txt",
      "id": "id:jS0rXekwguAAAAAAAAAABw",
      "client_modified": "2016-09-28T20:58:34Z",
      "server_modified": "2016-09-28T20:58:34Z",
      "rev": "c4bd4dafc",
      "size": 11
    }

Auth error:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": "add" }' \
        -d 'Hello world'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8

    Error in call to API function "files/upload": Must provide HTTP header
    "Authorization" or URL parameter "authorization".

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": "add" }' \
        -d 'Hello world'

    HTTP/1.1 401 invalid_access_token/...
    Content-Type: application/json
    WWW-Authenticate: Dropbox-API

    {
      "error_summary": "invalid_access_token/...",
      "error": {
        ".tag": "invalid_access_token"
      }
    }

No content type:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": "add" }' \
        -d 'Hello world'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8

    Error in call to API function "files/upload": Bad HTTP "Content-Type"
    header: "application/x-www-form-urlencoded".  Expecting one of
    "application/octet-stream", "text/plain; charset=dropbox-cors-hack".

Wrong mode:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": "update" }' \
        -d 'Hello world'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8

    Error in call to API function "files/upload": HTTP header "Dropbox-API-Arg":
    mode: expected object for 'update', got symbol


## Updating a file

With valid parameters:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": { ".tag": "update", "update": "c4bd4dafc" } }' \
        -d 'Hello again'

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "name": "hello.txt",
      "path_lower": "/hello.txt",
      "path_display": "/hello.txt",
      "id": "id:jS0rXekwguAAAAAAAAAABw",
      "client_modified": "2016-09-28T21:07:37Z",
      "server_modified": "2016-09-28T21:07:37Z",
      "rev": "d4bd4dafc",
      "size": 11
    }

Wrong mode:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": "add" }' \
        -d 'Hello again'

    HTTP/1.1 409 path/conflict/file/
    Content-Type: application/json

    {
      "error_summary": "path/conflict/file/",
      "error": {
        ".tag": "path",
        "reason": {
          ".tag": "conflict",
          "conflict": {
            ".tag": "file"
          }
        },
        "upload_session_id": "AAAAAAAAAEJjBreugQOYqw"
      }
    }

Wrong version:

    curl -siX POST https://content.dropboxapi.com/2/files/upload \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/octet-stream' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt", "mode": { ".tag": "update", "update": "deadbeef5" } }' \
        -d 'Hello again'

    HTTP/1.1 409 path/conflict/file/.
    Content-Type: application/json

    {
      "error_summary": "path/conflict/file/.",
      "error": {
        ".tag": "path",
        "reason": {
          ".tag": "conflict",
          "conflict": {
            ".tag": "file"
          }
        },
        "upload_session_id": "AAAAAAAAAEFo2vgKConWRA"
      }
    }


## Reading a file

With valid parameters:

    curl -siX POST https://content.dropboxapi.com/2/files/download \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt" }'

    HTTP/1.1 200 OK
    Content-Type: application/octet-stream
    Content-Length: 11
    etag: W/"d4bd4dafc"
    original-content-length: 11
    dropbox-api-result: {                           \
      "name": "hello.txt",                          \
      "path_lower": "/hello.txt",                   \
      "path_display": "/hello.txt",                 \
      "id": "id:jS0rXekwguAAAAAAAAAABw",            \
      "client_modified": "2016-09-28T21:07:37Z",    \
      "server_modified": "2016-09-28T21:07:37Z",    \
      "rev": "d4bd4dafc",                           \
      "size": 11                                    \
    }

    Hello again

Auth error:

    curl -siX POST https://content.dropboxapi.com/2/files/download \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Dropbox-API-Arg: { "path": "/hello.txt" }'

    HTTP/1.1 401 invalid_access_token/.
    Content-Type: application/json
    WWW-Authenticate: Dropbox-API

    {
      "error_summary": "invalid_access_token/.",
      "error": {
        ".tag": "invalid_access_token"
      }
    }

Missing file:

    curl -siX POST https://content.dropboxapi.com/2/files/download \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Dropbox-API-Arg: { "path": "hello.txt" }'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8

    Error in call to API function "files/download": HTTP header
    "Dropbox-API-Arg": path: 'hello.txt' did not match pattern
    '(/(.|[\r\n])*|id:.*)|(rev:[0-9a-f]{9,})|(ns:[0-9]+(/.*)?)'

    curl -siX POST https://content.dropboxapi.com/2/files/download \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Dropbox-API-Arg: { "path": "/missing.txt" }'

    HTTP/1.1 409 path/not_found/.
    Content-Type: application/json

    {
      "error_summary": "path/not_found/.",
      "error": {
        ".tag": "path",
        "path": {
          ".tag": "not_found"
        }
      }
    }

Bad args:

    curl -siX POST https://content.dropboxapi.com/2/files/download \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Dropbox-API-Arg: { "pat": "/hello.txt" }'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8

    Error in call to API function "files/download": HTTP header
    "Dropbox-API-Arg": unknown field 'pat'

    curl -siX POST https://content.dropboxapi.com/2/files/download \
        -H 'Authorization: Bearer [REDACTED]'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8

    Error in call to API function "files/download": Must provide HTTP header
    "Dropbox-API-Arg" or URL parameter "arg".


## Deleting a file

With valid parameters:

    curl -siX POST https://api.dropboxapi.com/2/files/delete \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/json' \
        -d '{ "path": "/hello.txt" }'

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 248
    Set-Cookie: gvc=[REDACTED]; expires=Mon, 27 Sep 2021 21:26:59 GMT; httponly; Path=/; secure
    X-Content-Type-Options: nosniff
    X-Dropbox-Http-Protocol: None
    X-Frame-Options: SAMEORIGIN

    {
      ".tag": "file",
      "name": "hello.txt",
      "path_lower": "/hello.txt",
      "path_display": "/hello.txt",
      "id": "id:jS0rXekwguAAAAAAAAAABw",
      "client_modified": "2016-09-28T21:07:37Z",
      "server_modified": "2016-09-28T21:07:37Z",
      "rev": "d4bd4dafc",
      "size": 11
    }

Missing file:

    curl -siX POST https://api.dropboxapi.com/2/files/delete \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/json' \
        -d '{ "path": "/hello.txt" }'

    HTTP/1.1 409 Conflict
    Content-Type: application/json
    Content-Length: 116

    {
      "error_summary": "path_lookup/not_found/.",
      "error": {
        ".tag": "path_lookup",
        "path_lookup": {
          ".tag": "not_found"
        }
      }
    }

Auth error:

    curl -siX POST https://api.dropboxapi.com/2/files/delete \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/json' \
        -d '{ "path": "/hello.txt" }'

    HTTP/1.1 401 Unauthorized
    Content-Type: application/json
    Content-Length: 85
    Www-Authenticate: Dropbox-API

    {
      "error_summary": "invalid_access_token/",
      "error": {
        ".tag": "invalid_access_token"
      }
    }

Missing content type:

    curl -siX POST https://api.dropboxapi.com/2/files/delete \
        -H 'Authorization: Bearer [REDACTED]' \
        -d '{ "path": "/hello.txt" }'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8
    Content-Length: 228

    Error in call to API function "files/delete": Bad HTTP "Content-Type"
    header: "application/x-www-form-urlencoded".  Expecting one of
    "application/json", "application/json; charset=utf-8", "text/plain;
    charset=dropbox-cors-hack".

Bad args:

    curl -siX POST https://api.dropboxapi.com/2/files/delete \
        -H 'Authorization: Bearer [REDACTED]' \
        -H 'Content-Type: application/json' \
        -d '{}'

    HTTP/1.1 400 Bad Request
    Content-Type: text/plain; charset=utf-8
    Content-Length: 89

    Error in call to API function "files/delete": request body: missing required
    field 'path'
