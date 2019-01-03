const minimist = require("minimist")
const log = require("log-less-fancy")()
const render = require("./render")
const { decodePbf } = require("./mbtiles/pbf/pbf_dump")
const { readTile, readMetadata, listFiles } = require("./mbtiles/mbtileReader")
const { writeTile, createMbtile } = require("./mbtiles/mbtileWriter")
const fs = require("fs")

var argv = minimist(process.argv.slice(2), { alias: { prop: "colorprop" } })
if (argv._.length !== 2) {
  console.log("Usage: npx rasterize-vector-tiles <source> <target>")
  console.log("")
  console.log("source    Vector tile set in .mbtiles format")
  console.log("target    Raster tile set to be created (.mbtiles)")
  console.log("")
  console.log("Options:")
  console.log(
    "   --colorprop value    Feature property to use for gray level (0-255), default='value'"
  )
  console.log(
    "   --nodata    255      Colorprop value to interpret as nodata (will not be rendered), default=255"
  )
  console.log(
    "   --antialias none     Control anti-aliasing (none/default/gray/subpixel), default=none"
  )
  console.log(
    "   --zoomlevel 14       Upper limit on zoom level to rasterize (0-99), default=highest in input file"
  )
  console.log(
    "   --png                Export as individual png files rather than .mbtiles archive"
  )
  process.exit(1)
}

const metadata = {
  name: "",
  type: "overlay",
  version: 1,
  description: "",
  format: "png"
}

const srcvtiles = argv._[0]
const targetMbtilePath = argv._[1]

async function createDatabase(targetMbtilePath) {
  return await createMbtile(targetMbtilePath, metadata)
}

const option = {
  bitmapsize: 256,
  colorprop: argv.colorprop || "value",
  nodata: argv.nodata || 255,
  antialias: argv.antialias || "none"
  zoomlevel: argv.zoomlevel || 99
  png: argv.png
}

console.log(option)
async function rasterize(srcvtiles, targetdb) {
  const files = await listFiles(srcvtiles, option.zoomlevel)
  console.log("Source tile count: " + files.length)
  for (let i = 0; i < files.length; i++) await rasterizeTile(files[i], targetdb)
  targetdb.close()
}

async function rasterizeTile(vtile, targetdb) {
  const pbfjson = decodePbf(vtile.tile_data)
  const imageBuffer = render(pbfjson, option)
  const { zoom_level, tile_column, tile_row } = vtile
  if(option.png)
    fs.writeFileSync(`${zoom_level}_${tile_column}_${tile_row}.png`, imageBuffer)
  else
    await writeTile(targetdb, zoom_level, tile_column, tile_row, imageBuffer)
}

async function convert(targetMbtilePath) {
  const targetdb = await createDatabase(targetMbtilePath)
  await rasterize(srcvtiles, targetdb)
}

convert(targetMbtilePath).then((reject, resolve) => {
  if (reject) throw new Error(reject)
})
