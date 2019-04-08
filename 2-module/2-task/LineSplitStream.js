const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._currentLine = '';
  }

  _transform(chunk, encoding, callback) {
    //console.log('>>', chunk, '>>');
    this._currentLine += chunk;
    this._parseCurrentLine(false);
    callback();
  }

  _flush(callback) {
    this._parseCurrentLine(true);
    callback();
  }

  _parseCurrentLine(callCallbackOnEnd) {
    let eolPos = -1;
    while ((eolPos = this._currentLine.indexOf(os.EOL)) >= 0) {
      let chunk = this._currentLine.substring(0, eolPos);
      this._currentLine = this._currentLine.substring(eolPos + os.EOL.length);
      this._push(chunk);
    }

    if (callCallbackOnEnd) {
      this._push(this._currentLine);
    }
  }

  _push(chunk) {
    if (chunk) {
      //console.log('<<', chunk, '<<');
      this.push(chunk);
    }
  }

}

module.exports = LineSplitStream;
