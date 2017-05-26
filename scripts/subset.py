from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options, save_font
import uuid
import os
import sys

def subsetFont(fontPath, subset):
    tmpOutputFontName = os.path.dirname(os.path.abspath( __file__ )) + "/tmp/" + str(uuid.uuid4()) + ".woff"

    font = TTFont(fontPath)

    options = Options()
    options.desubroutinize = True

    options.with_zopfli = True
    options.flavor = "woff"

    subsetter = Subsetter(options=options)
    subsetter.populate(text=subset)
    subsetter.subset(font)

    save_font(font, tmpOutputFontName, options)
    subsettedFont = 'data:;base64,' + open(tmpOutputFontName, "rb").read().encode("base64")

    cleanUp([tmpOutputFontName])

    print subsettedFont.replace('\n', '')

def cleanUp(files):
    for file in files:
        os.unlink(file)

def main(argv):
    subsetFont(str(sys.argv[1]), str(sys.argv[2]))

if __name__ == "__main__":
   main(sys.argv[1:])
