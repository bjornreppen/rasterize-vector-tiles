/*
While responding to tile requests we need to properly set content-type
for raster tiles so that all browsers can load the images.

We could have peeked inside the image binary header to detect file type,
however tiles may also be compressed.  Decompressing all tiles in order to
check image format would thus be quite costly.

Instead we will lazily query the metadata table for each tileset for the format
and then cache the value for each tile set in memory.
*/
const { readMetadata } = require("./mbtileReader");
const getFormat = require("./tileformat");

class MbtilesFormats {
  constructor() {
    this.map = {};
  }

  async getContentDescription(physicalDir) {
    const format = await this.getFormatString(physicalDir);
    return getFormat(format);
  }

  async getFormatString(physicalDir) {
    let value = this.map[physicalDir];
    if (value) return value;

    const meta = await readMetadata(physicalDir);
    value = meta.format;
    this.map[physicalDir] = value;
    return value;
  }
}

module.exports = new MbtilesFormats();
