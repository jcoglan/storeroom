# storeroom [![Build Status](https://travis-ci.org/jcoglan/storeroom.svg)](https://travis-ci.org/jcoglan/storeroom)

Storeroom is an encrypted key-value store, with some simple filesystem-like
elements added on. It's designed for storing relatively small amounts of data --
think password management and other kinds of credentials or notes that you'd
want to keep secure. It has been developed for use in web and command-line
applications, and is implemented as a JavaScript API.

Its storage design aims to obfuscate contents as much as possible while
supporting its API in a performant manner and making it work well on the web,
and with cloud storage providers. It currently supports the following storage
systems:

* Dropbox
* Local filesystem
* `localStorage`
* RemoteStorage

*CAVEAT EMPTOR*: this is early-stage software and is still in active development
as it is integrated with downstream applications. Although the storage has been
designed with future-proofing in mind, we may still make breaking changes. Usage
is entirely at your own risk.


## Installation

    npm install storeroom


## Usage

To create a store, you call `storeroom.createStore()` with a password and an
adapter. The password is used to run all the encryption operations and, once
created, the store is unreadable without the right password. The adapter
determines which type of backing storage you want to use.

For example, to create a store backed by the filesystem:

```js
var path      = require('path'),
    storeroom = require('storeroom');

var store = storeroom.createStore({
  password: 'your super secret password',
  adapter:  storeroom.createFileAdapter(path.join(__dirname, 'secrets'))
});
```

This call does not actually write anything to disk immediately; data is only
written when you begin reading or writing using the `store` object. This object
has the following methods:

#### `store.put(String name, Object value) -> Promise`

This saves an item into the store. The `name` must be a pathname-like string,
like `/foo`, `/api-keys/amazon` or `/notes/bank_details.txt`. The `value` can be
any JSON-serialisable object. If the given `name` already exists, its value will
be overwritten.

It returns a promise containing no value when the data has been written to disk.

```js
store.put('/users/alice', { name: 'Alice Smith' });
```

#### `store.remove(String name) -> Promise`

This deletes an item from the store by its name. It returns a promise containing
no value when the data has been written to disk.

```js
store.remove('/users/alice');
```

#### `store.get(String name) -> Promise Object`

This retrieves an item from the store and returns it in a promise. It returns a
promise that will yield a copy of the object that was saved using `put()`.

```js
store.get('/users/alice').then(function(value) {
  // value == { name: 'Alice Smith' }
});
```

#### `store.entries(String name) -> Promise Array`

This retrieves a list of the names of all the items stored in a certain
directory. It returns a promise that will yield an array of the items in the
given directory, relative to that directory. Items that are themselves
directories will have names ending in `/`. This method does not search the
directory recursively.

```js
store.entries('/users/').then(function(list) {
  // list == ['alice']
});
```


### Storage adapters

#### Filesystem

The filesystem adapter is created by supplying the pathname to a directory in
which to store the files on disk.

```js
var pathname = path.join(__dirname, 'store'),
    adapter  = storeroom.createFileAdapter(pathname);
```

#### `localStorage`

The `localStorage` adatper is create by supplying a prefix for the keys to use
when storing items in the storage, and optionally the type of storage you want
to use. This object can be any object with `setItem()`, `getItem()` and
`removeItem()` methods; the default is `localStorage`.

```js
var adapter = storeroom.createLocalStorageAdapter('prefix');

var adapter = storeroom.createLocalStorageAdapter('prefix', sessionStorage);
```

#### Dropbox

The Dropbox adapter is created using a credentials object that you need to
obtain by asking the user to connect their Dropbox account to your app. Use this
method to start the connection process, which opens a new window:

```js
var dropbox = storeroom.connectDropbox({
  key:      '3hco9uik0qgw0gcw',
  callback: 'https://example.com/callback'
});

dropbox.then(function(credentials) {
  var adapter = store.createDropboxAdapter(credentials);
});
```

`storeroom.connectDropbox()` takes the following options:

* `key`: the 'app key' for your application, which you can find via the [Dropbox
  developer site](https://www.dropbox.com/developers)
* `callback`: a URL on your site that handles OAuth callbacks; this is explained
  below
* `type`: optional, this specifies which type of OAuth flow to perform, either
  `'token'` (the default) or `'code'`
* `secret`: if you set `type: 'code'` then you must supply this; it's the 'app
  secret' that you can find via the Dropbox developer site

You should treat the `credentials` object as opaque, and don't assume it will
keep the same fields over time. However, you can serialize it using
`JSON.stringify()` if you need to store it for later use.

##### Handling OAuth callbacks

To handle OAuth callbacks, you need a page on your domain that Dropbox can
redirect back to. All this page needs to do is use a bit of code from
`storeroom` to handle the callback and pass the result back to your main page.

Create a minimal HTML page, something like this:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>OAuth 2.0 Acceptor</title>
  </head>
  <body>
    <script src="./acceptor.js"></script>
  </body>
</html>
```

`acceptor.js` should be a file containing the result of building this code with
Webpack, Browserify or your favourite module bundler:

```js
require('storeroom/oauth-callback');
```

You may need to register the URL of this page with Dropbox in advance in order
to allow redirects to it.

#### RemoteStorage

The RemoteStorage adapter is created using a credentials object that you need to
obtain by asking the user to connect their RemoteStorage account to your app.
Use this method to start the connection process, which opens a new window:

```js
var remote = storeroom.connectRemoteStorage({
  address:  'alice@5apps.com',
  scope:    'storeroom',
  client:   'Storeroom Demo',
  callback: 'https://example.com/callback'
});

remote.then(function(credentials) {
  var adapter = store.createRemoteStorageAdapter(credentials);
});
```

`storeroom.connectRemoteStorage()` takes the following options:

* `address`: this is the user's RemoteStorage address
* `scope`: the name of the directory on their storage that your app will use
* `client`: the name of your application
* `callback`: a URL on your site that handles OAuth callbacks

You should treat the `credentials` object as opaque, and don't assume it will
keep the same fields over time. However, you can serialize it using
`JSON.stringify()` if you need to store it for later use.

To handle OAuth callbacks, refer to [Handling OAuth
callbacks](#handling-oauth-callbacks).

#### Custom

If you need to integrate with a store not supported here, you can implement that
yourself. Storage adapters are simple objects that must implement the following
interface:

    adapter.read(String name) -> Promise String

`read()` should take a filename and return a promise for the contents of that
file, or a promise for `null` if the file does not exist.

    adapter.write(String name, String data) -> Promise

`write()` should take a filename and a string of data, and write the data to the
file, returning a promise indicating completion. `data` may be `null`, in which
case the adapter may delete the underlying file.

Any object supporting this interface can be passed as the `adapter` option to
`storeroom.createStore()` and everything should work.

For example, here is a conforming implementation that stores data in memory:

```js
var MemoryAdapter = function() {
  this._contents = Object.create(null);
};

MemoryAdapter.prototype.read = function(name) {
  return Promise.resolve(this._contents[name] || null);
};

MemoryAdapter.prototype.write = function(name, data) {
  if (data === null)
    delete this._contents[name];
  else
    this._contents[name] = data;

  return Promise.resolve();
};
```


## Storage design

The following section is advisory; the storage design may change in future
releases and you should not write code that is coupled to it. This description
refers to values being 'encrypted' or 'randomly generated' -- see the
'Cryptography' section below for definitions of these terms.

All the details of how Storeroom stores your data can be demonstrated by the
following example that writes two items to the store:

```js
var storeroom = require('storeroom');

var store = storeroom.createStore({
  password: 'I was there',
  adapter:  storeroom.createFileAdapter('store')
});

store.put('/users/alice', { name: 'Alice Smith' });

store.put('/users/bob', { name: 'Bob Jones' });
```

The first thing that Storeroom does when you save a value is it checks whether a
file called `.keys` exists, and creates it if not. This file is called the
*master keys file* and contains three randomly generated values:

* A 256-bit *hashing key*
* A 256-bit *encryption key*
* A 256-bit *signing key*

("File" in this example refers to a file on disk. If you're using a different
type of adapter, it might refer to a `localStorage` entry, a file in Dropbox,
etc.)

These values are concatenated and encrypted using the `password` that you
configured the store with. The result is written as a single base64-encoded blob
to the master keys file, with a byte at the front containing metadata about the
encryption parameters used.

```
store/.keys     {"version":1}
                E15CBlkkpXgwIbpo8WrM487QPMA45zMSl3GUXUMUoVnM1aA15NfklzguEnEkPy7q
                Bc43a6sfiDyaqiiN3CxTExiod6EvyhNcH5qaoARvll9KS5xHP98kptHlq3dSDtxv
                xfDWlI4FMw2uaU/tsvTYzdkQkcIVDQIFf/UVFWC8b0r3tHIqu4tHalCA0Jjo65Y6
                HhSd9Sg6yUzViNsMdgadlkg=
```

Like all the other files that will be explained shortly, the master keys file
begins with a JSON header that identifies the version of the storage format it
uses.

Once the master keys file exists, we can write the items into the store. The
store works a little like a hash table. It consists of a series of files whose
names are a single digit or letter. To find the right file to read or write an
item, we hash the 'filename' for the item (like `/users/alice`) using
HMAC-SHA-256 with the hashing key from the master keys file, and use the
trailing bits of that hash to determine which file to use.

Once we've picked a file to use, we can write the item. Each file consists of
multiple lines, where:

* The first line (the *header*) is an unencrypted JSON object containing
  metadata
* The second line (the *index*) is an encrypted sorted list of the names of the
  items in this file
* Each remaining lines (the *items*) are the encrypted values, ordered to
  correspond with the names in the index

For example, here's how the item `/users/alice -> { name: 'Alice Smith' }` is
written into a file. The name `/users/alice` is added to the index on the second
line, and then the JSON encoding of the value is added to the items in the
corresponding position. If the file is empty initially this leaves a single item
in the file:

```
store/M         {"version":1}
                ["/users/alice"]
                {"name":"Alice Smith"}
```

(The index and items are shown here without encryption. In actual use, these
values are encrypted as will be explained shortly.)

The item names in Storeroom look like filesystem pathnames, and indeed Storeroom
has a few filesystem-like features. For example, if you create the item
`/users/alice`, then you can ask for the items in the *virtual directory*
`/users/` and get `['alice']` in response.

To support this, as well as writing the item itself, Storeroom maintains indexes
of the *directory* structure. It stores directories in the same way as regular
items, where the value of a directory is a sorted list of the items within it.

In our example, the item `/users/alice` is in the `/users/` directory, which
itself is in the `/` directory. Here's an example where the `/` directory is
stored in the same file as `/users/bob`. The directory appears in the index
along with regular items, and its value is a list of its sub-items. If an item
in a directory is itself another directory, its name ends with a trailing `/`.

```
store/A         {"version":1}
                ["/","/users/bob"]
                ["users/"]
                {"name":"Bob Jones"}
```

The `/users` directory in this case is in its own file.

```
store/P         {"version":1}
                ["/users/"]
                ["alice","bob"]
```

These examples show the index and items unencrypted, but in actual use they are
encrypted as follows. When an item is written to the store, a random encryption
key and a random signing key are generated for the item; these are the *item
keys*. The item is encrypted using the item keys, and the item keys themselves
are encrypted using the encryption and signing keys from the master keys file.
The item key and item data ciphertexts are concatenated and written together as
a single base64-encoded blob. New item keys are generated every time the item is
updated.


### Cryptography

Values that are described as 'encrypted' above are generated by
[vault-cipher](https://github.com/jcoglan/vault-cipher), which is backed by the
[crypto](https://nodejs.org/api/crypto.html) module in Node, and
[asmCrypto](https://github.com/vibornoff/asmcrypto.js/) in the browser. Briefly,
this performs the following steps:

* Given a 256-bit *encryption key* and a 256-bit *signing key*,
* Generate a random 128-bit *IV*
* Encrypt the value using AES-256-CBC with the encryption key and the IV to
  create the *ciphertext*
* Sign (IV || ciphertext) using HMAC-SHA-256 with the signing key to create the
  *tag*
* Return (IV || ciphertext || tag)

The random IV here and the random keys generated for the master credentials and
item keys are generated by `crypto.randomBytes()` in Node, and
`crypto.getRandomValues()` in the browser, where available.

For the master keys, which are encrypted with the store password, the password
is run through PBKDF2 to generate the encryption and signing keys.


### Motivation

This module is designed to replace the storage backend in
[Vault](https://github.com/jcoglan/vault), a password manager I maintain. Its
original design simply stored all the saved items in a large JSON structure,
which was serialized and encrypted as a single file. This caused a number of
problems, namely:

* Looking up a single item requires decrypting the entire storage.
* Listing the available item names requires also decrypting their contents
* Having a single file increases the likelihood of write collisions when using a
  sync service like Dropbox, resulting in lost updates.
* The design of the file format itself did not allow for changes to its design
  over time in any simple way.

Storeroom is designed to solve these problems while maintaining a high degree of
protection for all data stored in it. For example, unlike some other encrypted
stores, it encrypts the item *names*, not just their data, and uses random IVs
by default so that the same data does not encrypt to the same ciphertext more
than once. This protection has been traded off against the ease of performing
certain common operations on the stored data, for example:

* Looking up a single item only requires decrypting the master keys, the index
  for the file containing the item, and the item itself. No other item rows are
  decrypted, and the directory depth of the item is not a factor.
* Due to the directory indexes, we can list the items in a directory just as
  quickly as looking up a single item, without decrypting the data that those
  item names refer to, and without storing the item names themselves in
  plaintext.
* Using a hashtable-like structure with multiple files reduces the size of
  requests when those files are sent via the web, and reduces the likelihood of
  write collisions and lost updates. Some storage adapters (for example
  Dropbox), use optimistic locking to ensure a client has the latest version of
  a file before allowing a write to succeed.
* Line-wise storage of items makes recovery easier to diagnose and fix by hand
  in the event that syncing does result in lost updates.
* The indirection provided by the master and item keys means the master password
  can be changed without rewriting the entire data store, or an individual item
  can be re-encrypted likewise.
* The files and the individual rows are annotated with metadata that will allow
  us to upgrade the encryption algorithms used on a per-row basis over time,
  without losing existing data.
