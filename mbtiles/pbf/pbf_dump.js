var VectorTile = require("@mapbox/vector-tile").VectorTile;
var Protobuf = require("pbf");
var { decompress } = require("./protobuf");

function decodePbf(buffer) {
  var tile = new VectorTile(new Protobuf(decompress(buffer)));
  Object.keys(tile.layers).forEach(key => {
    const layer = tile.layers[key];
    layer.features = [];
    for (let i = 0; i < layer.length; i++) {
      const f = layer.feature(i);
      const feature = {
        type: f.type,
        id: f.id,
        properties: f.properties,
        geom: f.loadGeometry()
      };
      layer.features.push(feature);
    }
    delete layer._pbf;
  });
  return tile;
}

module.exports = { decodePbf };
