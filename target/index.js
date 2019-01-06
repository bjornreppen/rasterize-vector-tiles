const Mbtiles = require('./mbtiles')
const PngFiles = require('./pngfiles')

async function create(zoomlevel, png, filePath) {
  const target = png ? new PngFiles() : new Mbtiles()
  await target.create(filePath, zoomlevel)
  return target
}

module.exports = { create }
