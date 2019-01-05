const {
  writeTile,
  createMbtile,
  createIndex
} = require("../mbtiles/mbtileWriter")
const fs = require("fs")
const path = require("path")

async function create(zoomlevel, png, filePath) {
  const target = png ? new PngFiles() : new Mbtiles()
  await target.create(filePath, zoomlevel)
  return target
}

class PngFiles {
  async create(filePath) {
    this.path = filePath
  }

  async createTile(zoom_level, tile_column, tile_row, imageBuffer) {
    const directory = path.join(this.path, `${zoom_level}/${tile_column}`)
    const fullPath = path.join(directory, `${tile_row}.png`)
    debugger
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(fullPath, imageBuffer)
  }

  close() {}
}

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

module.exports = { create }
