import { spawn, exec } from 'child_process'
import Promise from 'bluebird'
import { v4 as uuid } from 'node-uuid'
import { uniq, join, forEach } from 'ramda'
import path from 'path'
import fs from 'fs'
import bunyan from 'bunyan'

//logger
const level = process.env.DEBUG_SUBSETTY ? parseInt(process.env.DEBUG_SUBSETTY) : 60
const logger = bunyan.createLogger({ name: 'subsetty', level });

//paths
const FONTTOOLS = `${__dirname}/../fonttools/Lib/fontTools/subset`
const TTX = `${__dirname}/../fonttools/Lib/fontTools/ttx.py`
const TMP = `${__dirname}/.tmp`

function subset(fontBuffer, subset) {
  logger.trace('creating subset')
  try {
    fs.mkdirSync(TMP)
  } catch (e) {
    logger.info('tmp folder already exsists')
  }

  let cleanUp = []
  const fontPath = `${TMP}/${uuid()}.ttf`
  fs.writeFileSync(fontPath, fontBuffer)

  cleanUp.push(fontPath)

  return subsetFont(fontPath, subset)
    .then(newFont => {
      cleanUp.push(newFont)
      return fs.readFileSync(newFont)
    })
    .finally(() => {
      logger.trace('cleanup files', cleanUp)
      forEach(font => fs.unlink(font), cleanUp)
    })
    .catch(err => {
      logger.error('error subsetting from buffer', { err })
      return new Error('failed to subset font')
    })
}

function toWoff(fontBuffer) {
  logger.info('converting font')

  const fontName = uuid()
  const fontPath = `${TMP}/${fontName}.ttf`
  fs.writeFileSync(fontPath, fontBuffer)

  logger.trace('input path', fontPath)

  const cwd = `python ${TTX} ${fontPath} && python ${TTX} --flavor="woff" ${TMP}/${fontName}.ttx`
  const cleanUp = [`${TMP}/${fontName}.ttf`, `${TMP}/${fontName}.woff`, `${TMP}/${fontName}.ttx`]

  return new Promise(function(resolve, reject) {
      return exec(cwd, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(fs.readFileSync(`${TMP}/${fontName}.woff`))
      })
    })
    .finally(() => {
      logger.trace('cleanup files', cleanUp)
      forEach(font => fs.unlink(font), cleanUp)
    })
    .catch(err => {
      logger.error('error converting font', { err })
      return new Error('failed to convert font')
    })
}

function subsetFont(fontPath, subset) {
  return new Promise(function(resolve, reject) {
    const cleanSubset = join('', uniq(subset))
    logger.info('font subset', { cleanSubset })
    const subsetFlag = `--text="${cleanSubset}"`
    const process = spawn('python', [FONTTOOLS, fontPath, subsetFlag])

    process.stdout.on('close', () => {
      const fontName = path.basename(fontPath, '.ttf')
      const fontDir = path.dirname(fontPath)
      resolve(`${TMP}/${fontName}.subset.ttf`)
    })

    process.stdout.on('error', (err) => {
      logger.error('err subset', { err })
      return reject(err)
    })
  })
}

module.exports = { subset, toWoff }
