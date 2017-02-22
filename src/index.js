import { spawn } from 'child_process'
import Promise from 'bluebird'
import { v4 as uuid } from 'node-uuid'
import { uniq, join, forEach } from 'ramda'
import path from 'path'
import fs from 'fs'

const FONTTOOLS = `${__dirname}/../fonttools/Lib/fontTools/subset`
const TMP = `${__dirname}/.tmp`

function fromFile(fontPath, subset) {
  return subsetFont(fontPath, subset)
}

function fromBuffer(fontBuffer, subset) {
  try {
    fs.mkdirSync(TMP)
  } catch (e) {
    //tmp folder already exsists
  }

  let cleanUp = []
  const fontPath =  `${TMP}/${uuid()}.ttf`
  fs.writeFileSync(fontPath, fontBuffer)

  cleanUp.push(fontPath)

  return subsetFont(fontPath, subset)
    .then(newFont => {
      cleanUp.push(newFont)
      return fs.readFileSync(newFont)
    })
    .finally(() => {
      forEach(font => fs.unlink(font), cleanUp)
    })
}


function subsetFont(fontPath, subset) {
  return new Promise(function(resolve, reject) {
    const cleanSubset = join('', uniq(subset))
    const subsetFlag = `--text="${cleanSubset}"`
    const process = spawn('python', [FONTTOOLS, fontPath, subsetFlag])

    process.stdout.on('close', () => {
      const fontName = path.basename(fontPath, '.ttf')
      const fontDir = path.dirname(fontPath)
      resolve(`${TMP}/${fontName}.subset.ttf`)
    })

    process.stdout.on('error', (err) => {
      return reject(err)
    })

  })
}

module.exports = { fromFile, fromBuffer }
