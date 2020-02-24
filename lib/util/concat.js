'use strict';

function concat(stream, callback) {
  let chunks = [];
  stream.on('data', (chunk) => chunks.push(chunk));
  stream.on('end', () => callback(Buffer.concat(chunks)));
}

module.exports = concat;
