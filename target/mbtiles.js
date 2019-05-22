// Writes rendered tiles to mbtiles sqlite database
const log = require("../log")
const {
  open,
  writeTile,
  createMbtile,
  createIndex
} = require("../mbtiles/mbtileWriter")

class Mbtiles {
  async create(filePath, source) {
    this.filePath = filePath
    const metadata = JSON.parse(JSON.stringify(source.metadata))
    metadata.format = "png"
    delete metadata.json
    delete metadata.scheme
    log.debug("raster tile metadata", metadata)
    const mbtiles = await createMbtile(filePath, metadata)
    mbtiles.close()
  }

  async createTile(zoom_level, tile_column, tile_row, imageBuffer) {
    const mbtiles = open(this.filePath)
    await writeTile(mbtiles, zoom_level, tile_column, tile_row, imageBuffer)
    mbtiles.close()
  }

  close() {
    const mbtiles = open(this.filePath)
    createIndex(mbtiles)
    mbtiles.close()
  }
}

module.exports = Mbtiles
