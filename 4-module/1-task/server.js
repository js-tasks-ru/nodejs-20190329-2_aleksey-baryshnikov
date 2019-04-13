const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'GET':
      const pathname = url.parse(req.url).pathname.slice(1);
      const filepath = path.join(__dirname, 'files', pathname);

      if (pathname.indexOf('/') >= 0) {
        res.statusCode = 400;
        res.end('400 Can\'t request files inside directories');
      } else {

        fs.exists(filepath, exists => {
          if (!exists) {
            res.statusCode = 404;
            res.end('404 File doesn\'t exist');
          } else {

            fs.lstat(filepath, (err, stats) => {
              if (stats.isDirectory()) {
                res.statusCode = 400;
                res.end('400 Can\'t request directories');
              } else {
                var readStream = fs.createReadStream(filepath);
                readStream.pipe(res).on('error', error => {
                  res.statusCode = 500;
                  res.end(error);
                });
              }
            });

          }
        });

      }
      break;

    default:
      res.statusCode = 501;
      res.end('501 Not implemented');
  }
});

module.exports = server;
