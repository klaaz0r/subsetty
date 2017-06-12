'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _nodeUuid = require('node-uuid');

var _ramda = require('ramda');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _pythonShell = require('python-shell');

var _pythonShell2 = _interopRequireDefault(_pythonShell);

//logger
var level = process.env.DEBUG_SUBSETTY ? parseInt(process.env.DEBUG_SUBSETTY) : 60;
var logger = _bunyan2['default'].createLogger({ name: 'subsetty', level: level });

var scriptPath = __dirname.substring(0, __dirname.lastIndexOf('/')) + '/scripts';

function subset(fontPath, text) {
  return new _bluebird2['default'](function subsetFontPromise(resolve, reject) {
    _pythonShell2['default'].run('subset.py', { scriptPath: scriptPath, args: [fontPath, text] }, function (err, results) {
      if (err) {
        logger.error({ err: err }, 'error subsetting font');
        return reject(err);
      } else {
        logger.debug({ base64: results[0] }, 'got result from python');
        resolve(results[0]);
      }
    });
  });
}

function convert(fontPath, fontType) {
  return new _bluebird2['default'](function convertFontPromise(resolve, reject) {
    _pythonShell2['default'].run('convert.py', { scriptPath: scriptPath, args: [fontPath, fontType] }, function (err, results) {
      if (err) {
        logger.error({ err: err }, 'error subsetting font');
        return reject(err);
      } else {
        logger.debug({ base64: results[0] }, 'got result from python');
        resolve(results[0]);
      }
    });
  });
}

module.exports = { subset: subset, convert: convert };
