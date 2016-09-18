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


## Installation

    npm install storeroom


## Usage

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
store.put('/users/alice', {name: 'Alice Smith'});
```

#### `store.remove(String name) -> Promise`

This deletes an item from the store by its name. It returns a promise containing
no value when the data has been written to disk.

```js
store.remove('/users/alice');
```

#### `store.get(String name) -> Promise Object`

```js
store.get('/users/alice').then(function(value) {
  // value == {name: 'Alice Smith'}
});
```

#### `store.entries(String name) -> Promise Array`

```js
store.entries('/users/').then(function(list) {
  // list == ['alice']
});
```


### Storage adapters

#### Filesystem

#### `localStorage`

#### Dropbox

#### RemoteStorage

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


## Storage design

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

store.put('/users/alice', {name: 'Alice Smith'});

store.put('/users/bob', {name: 'Bob Jones'});
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
to the master keys file:

```
store/.keys     {"version":1}
                PnDl6Bt/KWDjLf0TVOuNiQ8iqA35VAny8GgzQW0J/3GzfalF5Nsr3PXoOpXDwkpL
                7VALU/YInkVNsWwjNTQz7sNLhGPBoUQ8PixHUwLz0Qi/6a25AOslbqAFXRE9QCl2
                YgLtIfmB8GtfPTey1cvMbaiRa3sZ+lvF9dfKXhPTKP9Cs2FyHV3NwQ0Od7iAOsDF
                NII8Kax4wAjOgJdr0TdtGw==
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

For example, here's how the item `/users/alice -> {name: 'Alice Smith'}` is
written into a file. The name `/users/alice` is added to the index on the second
line, and then the JSON encoding of the value is added to the items in the
corresponding position. If the file is empty initially this leaves a single item
in the file:

```
store/5         {"version":1}
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
itself is in the `/` directory. Here's an example where the `/users/` directory
is stored in the same file as `/users/bob`. The directory appears in the index
along with regular items, and its value is one of the items in the file:

```
store/L         {"version":1}
                ["/users/","/users/bob"]
                ["alice","bob"]
                {"name":"Bob Jones"}
```

The `/` directory in this case is in its own file. If an item in a directory is
itself another directory, its name ends with a trailing `/`.

```
store/T         {"version":1}
                ["/"]
                ["users/"]
```

These examples show the index and items unencrypted, but in actual use they are
encrypted as follows. When an item is written to the store, a random encryption
key and a random signing key are generated for the item; these are the *item
keys*. The item is encrypted using the item keys, and the item keys themselves
are encrypted using the encryption and signing keys from the master keys file.
The item key and item data ciphertexts are concatenated and written together as
a single base64-encoded blob. New item keys are generated every time the item is
updated.


### Motivation




### Cryptography

Values that are described as 'encrypted' above are generated by
[vault-cipher](https://github.com/jcoglan/vault-cipher), which is backed by the
[crypto](https://nodejs.org/api/crypto.html) module in Node, and
[crypto-js](https://www.npmjs.com/package/crypto-js) in the browser. Briefly,
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
