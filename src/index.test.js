import subsetty from '../dist/index.js'
import fs from 'fs'
import { expect } from 'chai'

const text = `
  Hello world! how are you doing? I am doing
  great!
  are you very fat..?
  this is some price € 12.00;-
  `

describe('font testing', function() {
  describe('all tests', function() {

    it('create subset from font buffer', function(cb) {
      subsetty.subset('fonts/opensans.ttf', text)
        .then(font => cb())
    })

    it('convert font to woff', function(cb) {
        subsetty.convert('fonts/opensans.ttf', 'ttf')
          .then(font => cb())
      })
      .timeout(6000)

  })
})
