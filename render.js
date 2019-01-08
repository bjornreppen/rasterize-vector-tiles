const { createCanvas, loadImage } = require("canvas")

function render(pbfjson, option) {
  const size = option.bitmapsize
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
    if (feature.type !== 3) return // Polygons only

    const level = feature.properties[option.colorprop]
    if (level === undefined && !option.color) {
      const props = Object.keys(feature.properties)
      if (props.length === 0)
        throw new Error("No feature properties in source file.")
      throw new Error(
        `No property named '${
          option.colorprop
        }' in source tile. Try '--colorprop ${props.join("/")}'`
      )
    }

    if (level === option.nodata) return

    ctx.fillStyle = level ? `rgb(${level},${level},${level})` : option.color
    feature.geom.forEach(geom => drawGeometry(ctx, geom, scaling))
  })
}

function drawGeometry(ctx, geom, scaling) {
  ctx.beginPath()
  geom.forEach(coord => ctx.lineTo(coord.x * scaling, coord.y * scaling))
  ctx.fill()
}

module.exports = render
