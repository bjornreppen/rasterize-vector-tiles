// Writes rendered tiles to mbtiles sqlite database
const {
  writeTile,
  createMbtile,
  createIndex
} = require("../mbtiles/mbtileWriter")

class Mbtiles {
  async create(filePath, zoomlevel) {
    const metadata = {
      name: "",
      type: "overlay",
      version: 1,
      description: "",
      format: "png",
      minzoom: zoomlevel,
      maxzoom: zoomlevel
    }
    this.mbtiles = await createMbtile(filePath, metadata)
  }

  async createTile(zoom_level, tile_column, tile_row, imageBuffer) {
    await writeTile(
      this.mbtiles,
      zoom_level,
      tile_column,
      tile_row,
      imageBuffer
    )
  }

  close() {
    createIndex(this.mbtiles)
    this.mbtiles.close()
  }
}

module.exports = Mbtiles
