import { spawn, exec } from 'child_process'
import Promise from 'bluebird'
import { v4 as uuid } from 'node-uuid'
import { uniq, join, forEach } from 'ramda'
import path from 'path'
import fs from 'fs'
import bunyan from 'bunyan'
import Python from 'python-shell'

//logger
const level = process.env.DEBUG_SUBSETTY ? parseInt(process.env.DEBUG_SUBSETTY) : 60
const logger = bunyan.createLogger({ name: 'subsetty', level });

const scriptPath = __dirname.substring(0, __dirname.lastIndexOf('/')) + '/scripts'

function subset(fontPath, text) {
  return new Promise(function subsetFontPromise(resolve, reject) {
    Python.run('subset.py', { scriptPath, args: [fontPath, text] }, (err, results) => {
      if (err) {
        logger.error({ err }, 'error subsetting font')
        return reject(err)
      } else {
        logger.debug({ base64: results[0] }, 'got result from python')
        resolve(results[0])
      }
    })
  })
}

function convert(fontPath, fontType) {
  return new Promise(function convertFontPromise(resolve, reject) {
    Python.run('convert.py', { scriptPath, args: [fontPath, fontType] }, (err, results) => {
      if (err) {
        logger.error({ err }, 'error subsetting font')
        return reject(err)
      } else {
        logger.debug({ base64: results[0] }, 'got result from python')
        resolve(results[0])
      }
    })
  })
}

module.exports = { subset, convert }
