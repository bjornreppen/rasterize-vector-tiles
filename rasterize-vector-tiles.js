#!/usr/bin/env node
"use strict"
const log = require("log-less-fancy")()
const meow = require("meow")
const foo = require(".")

const cli = meow(
  `
	Usage
	  $ rasterize-vector-tiles -i <input> -o <output> [options]

	Options
    --source, -i   Vector tile set in .mbtiles format
    --target, -o   Raster tile set to be created (.mbtiles)
    --colorprop    Feature property to use for gray level (0-255), default='value'"
    --nodata       Colorprop value to interpret as nodata (will not be rendered), default=255"
    --antialias    Control anti-aliasing (none/default/gray/subpixel), default=none"
    --zoomlevel    Upper limit on zoom level to rasterize (0-99), default=highest in input file"
    --bitmapsize   Width/Height of the created rasters, default = 256
    --png          Export as individual png files rather than .mbtiles archive"

	Examples
	  $ rasterize-vector-tiles -i vector.mbtiles -o raster.mbtiles -prop value
	  🌈 unicorns 🌈
`,
  {
    flags: {
      source: {
        type: "string",
        alias: "i"
      },
      target: {
        type: "string",
        alias: "o"
      },
      colorprop: {
        type: "string",
        alias: "prop",
        default: "value"
      },
      nodata: {
        type: "number",
        default: 255
      },
      antialias: {
        type: "string",
        default: "none"
      },
      zoomlevel: {
        type: "number",
        default: 99
      },
      bitmapsize: {
        type: "number",
        default: 256
      },
      png: {
        type: "boolean",
        default: false
      }
    }
  }
)

log.warn(cli)

const render = require("./render")
const { decodePbf } = require("./mbtiles/pbf/pbf_dump")
const { readTile, readMetadata, listFiles } = require("./mbtiles/mbtileReader")
const { writeTile, createMbtile } = require("./mbtiles/mbtileWriter")
const fs = require("fs")

const metadata = {
  name: "",
  type: "overlay",
  version: 1,
  description: "",
  format: "png"
}

const option = cli.flags
//console.log(option)

async function rasterize(targetdb) {
  log.info("Reading from " + option.source)
  const files = await listFiles(option.source, option.zoomlevel)
  console.log("Source tile count: " + files.length)
  for (let i = 0; i < files.length; i++) await rasterizeTile(files[i], targetdb)
  targetdb.close()
}

async function rasterizeTile(vtile, targetdb) {
  const pbfjson = decodePbf(vtile.tile_data)
  const imageBuffer = render(pbfjson, option)
  const { zoom_level, tile_column, tile_row } = vtile
  if (option.png)
    fs.writeFileSync(
      `${zoom_level}_${tile_column}_${tile_row}.png`,
      imageBuffer
    )
  else await writeTile(targetdb, zoom_level, tile_column, tile_row, imageBuffer)
}

async function convert() {
  const targetdb = await createMbtile(option.target, metadata)
  await rasterize(targetdb)
}

convert().then((reject, resolve) => {
  if (reject) throw new Error(reject)
})
