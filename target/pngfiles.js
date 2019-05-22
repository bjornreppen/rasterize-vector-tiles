// Writes rendered tiles to separate png fiels in zyx directory structure
const fs = require("fs-extra");
const path = require("path");

class PngFiles {
  async create(filePath) {
    this.path = filePath;
  }

  async createTile(zoom_level, tile_column, tile_row, imageBuffer) {
    const directory = path.join(this.path, `${zoom_level}/${tile_column}`);
    const fullPath = path.join(directory, `${tile_row}.png`);
    fs.ensureDirSync(directory);
    fs.writeFileSync(fullPath, imageBuffer);
  }

  close() {}
}

module.exports = PngFiles;
