const { createCanvas, loadImage } = require("canvas")

function render(pbfjson, option) {
  const size = parseInt(option.bitmapsize) || 256
  const scaling = size / 4096 // Coordinates 0-4095 in MVT

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")
  ctx.antialias = option.antialias
  Object.keys(pbfjson.layers).forEach(key =>
    drawGeometries(ctx, pbfjson.layers[key].features, scaling, option)
  )

  return canvas.toBuffer()
}

function drawGeometries(ctx, features, scaling, option) {
  features.forEach(feature => {
    const level = feature.properties[option.colorprop]
    if (level === undefined)
      throw new Error(
        `No property named '${
          option.colorprop
        }' in source tile. Try '--colorprop ${Object.keys(
          feature.properties
        ).join("/")}'`
      )
    if (level !== option.nodata) {
      ctx.fillStyle = `rgb(${level},${level},${level})`
      feature.geom.forEach(geom => {
        drawGeometry(ctx, feature.type, geom, scaling)
      })
    }
  })
}

function drawGeometry(ctx, type, geom, scaling) {
  if (type !== 3) return // Polygons only
  ctx.beginPath()
  geom.forEach(coord => ctx.lineTo(coord.x * scaling, coord.y * scaling))
  ctx.fill()
}

module.exports = render
