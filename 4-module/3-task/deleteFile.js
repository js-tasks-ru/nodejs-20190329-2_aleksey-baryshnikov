const fs = require('fs');

module.exports = function (filePath, req, res) {
    fs.unlink(filePath, err => {
        if (err) {
            res.statusCode = 404;
            res.end('File not found')
        } else {
            res.statusCode = 200;
            res.end();
        }
    })
}