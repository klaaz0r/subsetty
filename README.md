# 📝 subsetty

Subsetting fonts for node using fonttools

`npm install subsetty`

requires Python 2.7, 3.4 or later!

```javascript
import subset from './index'

subset.fromFile('fonts/opensans.ttf', 'hello world')
  .then(font => /* do something with the font path */)

subset.fromBuffer(buffer, 'hello world')
  .then(font => /* do something with the font buffer */)

```
