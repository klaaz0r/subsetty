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

var FONTTOOLS = __dirname + '/../fonttools/Lib/fontTools/subset';
var TMP = __dirname + '/.tmp';

function fromFile(fontPath, subset) {
  return subsetFont(fontPath, subset);
}

function fromBuffer(fontBuffer, subset) {
  try {
    _fs2['default'].mkdirSync(TMP);
  } catch (e) {
    //tmp folder already exsists
  }

  var cleanUp = [];
  var fontPath = TMP + '/' + (0, _nodeUuid.v4)() + '.ttf';
  _fs2['default'].writeFileSync(fontPath, fontBuffer);

  cleanUp.push(fontPath);

  return subsetFont(fontPath, subset).then(function (newFont) {
    cleanUp.push(newFont);
    return _fs2['default'].readFileSync(newFont);
  })['finally'](function () {
    (0, _ramda.forEach)(function (font) {
      return _fs2['default'].unlink(font);
    }, cleanUp);
  });
}

function subsetFont(fontPath, subset) {
  return new _bluebird2['default'](function (resolve, reject) {
    var cleanSubset = (0, _ramda.join)('', (0, _ramda.uniq)(subset));
    var subsetFlag = '--text="' + cleanSubset + '"';
    var process = (0, _child_process.spawn)('python', [FONTTOOLS, fontPath, subsetFlag]);

    process.stdout.on('close', function () {
      var fontName = _path2['default'].basename(fontPath, '.ttf');
      var fontDir = _path2['default'].dirname(fontPath);
      resolve(TMP + '/' + fontName + '.subset.ttf');
    });

    process.stdout.on('error', function (err) {
      return reject(err);
    });
  });
}

module.exports = { fromFile: fromFile, fromBuffer: fromBuffer };
