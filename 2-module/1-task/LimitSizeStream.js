const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {

  constructor(options) {
    super(options);
    this._length = 0;
    this._limit = options.limit || 0;
  }

  _transform(chunk, encoding, callback) {
    if (this._limit <= 0 || chunk.length + this._length <= this._limit) {
      this._length += chunk.length;
      callback(null, chunk);
    } else {
      callback(new LimitExceededError(), null);
    }
  }
}

module.exports = LimitSizeStream;
