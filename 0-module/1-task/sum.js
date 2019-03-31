const isNumber = require('is-number');

function sum(a, b) {
  if (!isNumber(a) || !isNumber(b)) {
    throw new TypeError();
  }
  return a + b;
}

module.exports = sum;
