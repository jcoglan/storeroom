var vstore = require('../../');

var dropbox = vstore.createDropboxAdapter({
  authorization: {
    // get these by running the browser OAuth flow
  }
});

var filename = process.argv[2],
    content  = process.argv[3] || null;

dropbox.read(filename).then(function(content) {
  console.log('[READ]', content);

}).then(function() {
  return dropbox.write(filename, content)

}).then(console.log, console.error);
