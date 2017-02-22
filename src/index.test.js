import subset from './index'
import fs from 'fs'

describe('subset tests', function() {
  describe('all', function() {
    it('from file', function(cb) {
      subset.fromFile('fonts/opensans.ttf', 'hello world')
        .then(font => {
          console.log('done', font);
          cb()
        })
    })

    it('from buffer', function(cb) {
      const buffer = fs.readFileSync('fonts/opensans.ttf')
      subset.fromBuffer(buffer, 'hello world')
        .then(font => {
          console.log('done', font);
          cb()
        })
    })
  })
})
