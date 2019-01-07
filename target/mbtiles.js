// Writes rendered tiles to mbtiles sqlite database
const {
  open,
  writeTile,
  createMbtile,
  createIndex
} = require("../mbtiles/mbtileWriter")

class Mbtiles {
  async create(filePath, zoomlevel) {
    this.filePath = filePath
    const metadata = {
      name: "",
      type: "overlay",
      version: 1,
      description: "",
      format: "png",
      minzoom: zoomlevel,
      maxzoom: zoomlevel
    }
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
