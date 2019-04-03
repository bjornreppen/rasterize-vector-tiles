const { createCanvas, loadImage } = require("canvas");

function render(pbfjson, option) {
  const size = option.bitmapsize;
  const scaling = size / 4096; // Coordinates 0-4095 in MVT

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.antialias = option.antialias;

  Object.keys(pbfjson.layers).forEach(key =>
    drawGeometries(ctx, pbfjson.layers[key].features, scaling, option)
  );

  if (found_properties.length === 0)
    throw new Error("No feature properties in source file.");
  if (!found_properties.has(option.colorprop))
    throw new Error(
      `No property named '${
        option.colorprop
      }' in source tile. Try '--colorprop <propertyname>' \nProperties found: ${Array.from(
        found_properties
      ).join(", ")}`
    );
  return canvas.toBuffer();
}

const found_properties = new Set();
function drawGeometries(ctx, features, scaling, option) {
  features.forEach(feature => {
    if (feature.type !== 3) return; // Polygons only

    const level = feature.properties[option.colorprop];
    Object.keys(feature.properties).forEach(prop => {
      found_properties.add(prop);
    });
    if (level === option.nodata) return;

    ctx.fillStyle = level ? `rgb(${level},${level},${level})` : option.color;
    feature.geom.forEach(geom => drawGeometry(ctx, geom, scaling));
  });
}

function drawGeometry(ctx, geom, scaling) {
  ctx.beginPath();
  geom.forEach(coord => ctx.lineTo(coord.x * scaling, coord.y * scaling));
  ctx.fill();
}

module.exports = render;
