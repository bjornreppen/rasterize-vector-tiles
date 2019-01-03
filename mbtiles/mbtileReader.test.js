const mbTileReader = require("./mbtileReader");

test("readTile", () => {
  return mbTileReader
    .readTile("./testdata/pbf.mbtiles", 3, 4, 2)
    .then(tile => expect(tile).toMatchSnapshot());
});
