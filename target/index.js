const Mbtiles = require('./mbtiles')
const PngFiles = require('./pngfiles')

async function create(source, png, filePath) {
  const target = png ? new PngFiles() : new Mbtiles()
  await target.create(filePath, source)
  return target
}

module.exports = { create }
