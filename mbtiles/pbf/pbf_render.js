const { createCanvas, loadImage } = require("canvas");

// http://localhost:8000/AO.mbtiles/4/8/3?format=png&border=rgba(128,128,128,0.2)&size=768&font=8px%20Tahoma&fontColor=rgba(0,0,0,0.3)&stroke=rgba(0,0,0,0.4)

const colors = [
  "rgba(255,255,217,0.5)",
  "rgba(237,248,177,0.5)",
  "rgba(199,233,180,0.5)",
  "rgba(127,205,187,0.5)",
  "rgba(65,182,196,0.5)",
  "rgba(29,145,192,0.5)",
  "rgba(34,94,168,0.5)",
  "rgba(37,52,148,0.5)",
  "rgba(8,29,88,0.5)"
];

function render(pbfjson, option) {
  const size = parseInt(option.size) || 512;
  const scaling = size / 4096; // Coordinates 0-4095 in MVT

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.font = option.font; // || "8px Tahoma";
  ctx.lineWidth = 1;
  ctx.antialias = option.antialias || "default";
  let colorIndex = 0;
  border(ctx, option.border, size);
  if (option.stroke) ctx.strokeStyle = option.stroke;
  Object.keys(pbfjson.layers).forEach(key => {
    colorIndex = (colorIndex + 1) % colors.length;
    ctx.fillStyle = colors[colorIndex];
    const features = pbfjson.layers[key].features;
    drawGeometries(ctx, option.stroke, features, scaling, colorIndex);
    drawLabels(ctx, option.font, option.fontColor, features, scaling);
  });

  return canvas.toBuffer();
}

function drawGeometries(ctx, stroke, features, scaling, colorIndex) {
  features.forEach(feature => {
    ctx.fillStyle = colors[colorIndex];
    feature.geom.forEach(geom =>
      drawGeometry(ctx, feature.type, stroke, geom, scaling)
    );
  });
}

function drawLabels(ctx, font, fontColor, features, scaling) {
  if (!font) return;
  ctx.fillStyle = fontColor;
  features.forEach(feature => {
    const name = feature.properties.name;
    if (name)
      feature.geom.forEach(geom => {
        drawText(ctx, name, calcBboxCenter(geom), scaling);
      });
  });
}

function border(ctx, color, size) {
  if (!color) return;
  ctx.strokeStyle = color;
  ctx.rect(0.5, 0.5, size - 0.5, size - 0.5);
  ctx.stroke();
}

function calcBboxCenter(geom) {
  let min = { x: 1e9, y: 1e9 };
  let max = { x: 0, y: 0 };
  geom.forEach(co => {
    min.x = Math.min(min.x, co.x);
    max.x = Math.max(max.x, co.x);
    min.y = Math.min(min.y, co.y);
    max.y = Math.max(max.y, co.y);
  });
  const count = geom.length;
  return { x: 0.5 * (min.x + max.x), y: 0.5 * (min.y + max.y) };
}

function drawText(ctx, label, position, scaling) {
  const metrics = ctx.measureText(label);
  const co = {
    x: Math.round(position.x * scaling - 0.5 * metrics.width),
    y: Math.round(position.y * scaling - 0.5 * metrics.actualBoundingBoxAscent)
  };
  ctx.fillText(label, co.x, co.y);
}

function drawGeometry(ctx, type, stroke, geom, scaling) {
  ctx.beginPath();
  geom.forEach(coord => {
    ctx.lineTo(coord.x * scaling, coord.y * scaling);
  });

  if (stroke) {
    ctx.stroke();
  }

  // POINT = 1
  // LINESTRING = 2
  // POLYGON = 3
  if (type === 3) ctx.fill();
}

module.exports = render;
