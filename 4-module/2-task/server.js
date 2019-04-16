const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {

  var end = (statusCode, message) => {
    console.log('<<<', statusCode, message);
    res.statusCode = statusCode;
    try { res.end(message); } catch { }
  };

  switch (req.method) {
    case 'POST':
      console.log('>>> post data retrieved')

      const pathname = url.parse(req.url).pathname.slice(1);
      const filepath = path.join(__dirname, 'files', pathname);

      if (pathname.indexOf('/') >= 0) {
        end(400, '400 Can\'t request files inside directories');
        return;
      }

      fs.exists(filepath, exists => {

        if (exists) {
          end(409, '409 File already exists');
          return;
        }

        // file doens't exist

        var writeStream = fs.createWriteStream(filepath);
        var limitSizeStream = new LimitSizeStream({ limit: 1 * 1024 * 1024 });
        var thereWasAnError = false;

        var alreadyRemoved = false;
        var removeFile = (removeFileCallback) => {
          if (alreadyRemoved) return;
          alreadyRemoved = true;
          try { writeStream.destroy(); } catch { }
          fs.unlink(filepath, err => {
            if (err) {
              console.error('failed to remove file ', filepath, err);
            } else {
              console.log('file removed successfully');
            }

            if (removeFileCallback) {
              removeFileCallback();
            }
          });
        }

        var errorHandler = (err) => {
          //if (thereWasAnError) return;
          console.log('>>> pipe error')
          thereWasAnError = true;
          try { limitSizeStream.destroy(); } catch { }
          removeFile(() => {
            if (err instanceof LimitExceededError) {
              end(413, '413 file size exceeded');
            } else {
              end(500, 'some error occured');
            }
          });
        };

        req.pipe(limitSizeStream).on('error', errorHandler).pipe(writeStream).on('error', errorHandler);

        req.on('close', () => {
          console.log('>>> req.on close')
          removeFile(() => {
            //res.end();
            //end(500, 'client disconnected');
          });
        });
        req.on('end', () => {
          console.log('>>> req.on end')
          if (!thereWasAnError) { end(201, ''); }
        });

      });

      break;

    default:
      end(501, 'Not implemented');
  }
});

module.exports = server;
