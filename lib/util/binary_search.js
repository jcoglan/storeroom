'use strict';

module.exports = function(array, value) {
  let n = array.length,
      i = 0,
      d = n;

  if (n === 0) return -1;

  if (value < array[0])   return -1;
  if (value > array[n-1]) return -1 - n;

  while (value !== array[i] && d >= 1) {
    d /= 2;
    i += (value > array[i] ? 1 : -1) * Math.round(d);
    if (i > 0 && value > array[i-1] && value < array[i]) d = 0;
  }

  return value === array[i] ? i : -1 - i;
};
