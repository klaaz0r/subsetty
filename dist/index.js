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

//logger
var level = process.env.DEBUG_SUBSETTY ? parseInt(process.env.DEBUG_SUBSETTY) : 60;
var logger = _bunyan2['default'].createLogger({ name: 'subsetty', level: level });

//paths
var FONTTOOLS = __dirname + '/../fonttools/Lib/fontTools/subset';
var TTX = __dirname + '/../fonttools/Lib/fontTools/ttx.py';
var TMP = __dirname + '/.tmp';

function subset(fontBuffer, subset) {
  logger.trace('creating subset');
  try {
    _fs2['default'].mkdirSync(TMP);
  } catch (e) {
    logger.info('tmp folder already exsists');
  }

  var cleanUp = [];
  var fontPath = TMP + '/' + (0, _nodeUuid.v4)() + '.ttf';
  _fs2['default'].writeFileSync(fontPath, fontBuffer);

  cleanUp.push(fontPath);

  return subsetFont(fontPath, subset).then(function (newFont) {
    cleanUp.push(newFont);
    return _fs2['default'].readFileSync(newFont);
  })['finally'](function () {
    logger.trace('cleanup files', cleanUp);
    (0, _ramda.forEach)(function (font) {
      return _fs2['default'].unlink(font);
    }, cleanUp);
  })['catch'](function (err) {
    logger.error('error subsetting from buffer', { err: err });
    return new Error('failed to subset font');
  });
}

function toWoff(fontBuffer) {
  logger.info('converting font');

  var fontName = (0, _nodeUuid.v4)();
  var fontPath = TMP + '/' + fontName + '.ttf';
  _fs2['default'].writeFileSync(fontPath, fontBuffer);

  logger.trace('input path', fontPath);

  var cwd = 'python ' + TTX + ' ' + fontPath + ' && python ' + TTX + ' --flavor="woff" ' + TMP + '/' + fontName + '.ttx';
  var cleanUp = [TMP + '/' + fontName + '.ttf', TMP + '/' + fontName + '.woff', TMP + '/' + fontName + '.ttx'];

  return new _bluebird2['default'](function (resolve, reject) {
    return (0, _child_process.exec)(cwd, function (err, data) {
      if (err) {
        return reject(err);
      }
      resolve(_fs2['default'].readFileSync(TMP + '/' + fontName + '.woff'));
    });
  })['finally'](function () {
    logger.trace('cleanup files', cleanUp);
    (0, _ramda.forEach)(function (font) {
      return _fs2['default'].unlink(font);
    }, cleanUp);
  })['catch'](function (err) {
    logger.error('error converting font', { err: err });
    return new Error('failed to convert font');
  });
}

function subsetFont(fontPath, subset) {
  return new _bluebird2['default'](function (resolve, reject) {
    var cleanSubset = (0, _ramda.join)('', (0, _ramda.uniq)(subset));
    logger.info('font subset', { cleanSubset: cleanSubset });
    var subsetFlag = '--text="' + cleanSubset + '"';
    var process = (0, _child_process.spawn)('python', [FONTTOOLS, fontPath, subsetFlag]);

    process.stdout.on('close', function () {
      var fontName = _path2['default'].basename(fontPath, '.ttf');
      var fontDir = _path2['default'].dirname(fontPath);
      resolve(TMP + '/' + fontName + '.subset.ttf');
    });

    process.stdout.on('error', function (err) {
      logger.error('err subset', { err: err });
      return reject(err);
    });
  });
}

module.exports = { subset: subset, toWoff: toWoff };
