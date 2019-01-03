const MbTilesHandler = require("./");

const mbtiles = new MbTilesHandler();

test("get pbf", async () => {
  const cursor = {
    type: "mbtiles",
    content: { format: "pbf" },
    physicalDir: "./testdata/pbf.mbtiles",
    pathSegments: [],
    query: {},
    link: ""
  };
  const fragment = [];
  const ext = "";
  await mbtiles.load(cursor).then(value => expect(value).toMatchSnapshot());
});
