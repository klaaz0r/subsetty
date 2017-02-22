# 📝 subsetty

Subsetting fonts for node using fonttools

## install

`npm install subsetty`

subset takes two arguments, a font and the subset text. The subset text get's filtered with Ramda `join('', uniq(subset))` will get rid of all the duplicated characters.

## howto
requires Python 2.7, 3.4 or later!

```javascript
import subset from './index'

subset.fromFile('fonts/opensans.ttf', 'hello world')
  .then(font => /* do something with the font path */)

subset.fromBuffer(buffer, 'hello world')
  .then(font => /* do something with the font buffer */)

```
