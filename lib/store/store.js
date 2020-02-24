'use strict';

const Bucket     = require('./bucket'),
      MasterKeys = require('./master_keys'),
      Mutex      = require('../util/mutex'),
      Promise    = require('../util/promise'),
      parsePath  = require('../util/parse_path');

const IS_DIR = /\/$/;

class Store {
  constructor(options) {
    this._backend = options.adapter;
    this._options = options;
    this._mutexes = {};
  }

  get(pathname) {
    pathname = pathname.replace(/^\/?/, '/');
    if (IS_DIR.test(pathname))
      return Promise.reject(new Error('Pathname for get() must not end with "/"'));

    return this._getKeys().then((masterKeys) => {
      let name = masterKeys.hashPathname(pathname);

      return this._backend.read(name).then((string) => {
        let bucket = Bucket.parse(string, { cipher: masterKeys });
        return bucket.get(pathname);
      });
    });
  }

  entries(dirname) {
    dirname = dirname.replace(/^\/?/, '/');
    if (!IS_DIR.test(dirname))
      return Promise.reject(new Error('Pathname for entries() must end with "/"'));

    return this._getKeys().then((masterKeys) => {
      let name = masterKeys.hashPathname(dirname);

      return this._backend.read(name).then((string) => {
        let bucket = Bucket.parse(string, { cipher: masterKeys });
        return bucket.entries(dirname);
      });
    });
  }

  // TODO turn this into a bulk operation that caches bucket reads
  findRecursive(dirname, prefix) {
    prefix = prefix || '';

    return this.entries(dirname).then((entries) => {
      let lists = entries.map((entry) => {
        let fullPath = prefix + entry;

        return IS_DIR.test(entry)
             ? this.findRecursive(dirname + entry, fullPath)
             : [fullPath];
      });
      return Promise.all(lists);

    }).then((lists) => {
      return lists.reduce((a, b) => a.concat(b), []);
    });
  }

  put(pathname, value) {
    let pathParts = parsePath(pathname),
        children  = [];

    return this._getKeys().then((masterKeys) => {
      let docBucket = masterKeys.hashPathname(pathname);

      pathParts.reduce((parent, child) => {
        let pathname = parent.pathname;
        children.push([masterKeys.hashPathname(pathname), pathname, child.filename]);
        return child;
      });

      let names = children.map((c) => c[0]).concat(docBucket);

      return this._withBuckets(names, masterKeys, (buckets) => {
        for (let child of children) {
          buckets[child[0]].addChild(child[1], child[2]);
        }
        buckets[docBucket].put(pathname, value);
      });
    });
  }

  remove(pathname) {
    let pathParts = parsePath(pathname),
        pathnames = pathParts.map((p) => p.pathname);

    return this._getKeys().then((masterKeys) => {
      let names = pathnames.map(masterKeys.hashPathname, masterKeys);

      return this._withBuckets(names, masterKeys, (buckets) => {
        let i = pathParts.length - 1,
            doc, docBucket;

        doc = pathParts[i];
        docBucket = buckets[names[i]];
        docBucket.remove(doc.pathname);

        while (i--) {
          doc = pathParts[i];
          docBucket = buckets[names[i]];

          if (docBucket.entries(doc.pathname).length === 1) {
            docBucket.remove(doc.pathname);
          } else {
            docBucket.removeChild(doc.pathname, pathParts[i + 1].filename);
            break;
          }
        }
      });
    });
  }

  // TODO: maybe we can optimise this by calculating all the changes needed and
  // changing each bucket once, rather than doing it incrementally
  removeRecursive(dirname) {
    return this.findRecursive(dirname).then((items) => {
      let deletions = items.map((item) => this.remove(dirname + item));
      return Promise.all(deletions);
    });
  }

  _getKeys() {
    return this._masterKeys = this._masterKeys || MasterKeys.create(this._options);
  }

  _mutex(name) {
    return this._mutexes[name] = this._mutexes[name] || new Mutex();
  }

  _withBuckets(names, masterKeys, task) {
    let set = {};
    for (let name of names) set[name] = true;
    names = Object.keys(set).sort();

    let mutexes = names.map(this._mutex, this),
        buckets = {};

    return Mutex.multi(mutexes, () => {
      let bucketsLoaded = names.map((name) => {
        return this._backend.read(name).then((string) => {
          buckets[name] = Bucket.parse(string, { cipher: masterKeys });
        });
      });

      return Promise.all(bucketsLoaded).then(() => {
        task(buckets);

        let writes = names.map((name) => {
          return this._backend.write(name, buckets[name].serialize());
        });
        return Promise.all(writes);
      });
    });
  }
}

module.exports = Store;
