#!/usr/bin/env node
"use strict";
const meow = require("meow");
const log = require("./log");
const target = require("./target");
const render = require("./render");
const { decodePbf } = require("./mbtiles/pbf/pbf_dump");
const { readTile, readMetadata, listFiles } = require("./mbtiles/mbtileReader");
const printProgress = require("./printprogress");

const cli = meow(
  `
	Usage
	  $ rasterize-vector-tiles -i <input> -o <output> [options]

	Options
    --source, -i   Vector tile set in .mbtiles format
    --target, -o   Raster tile set to be created (.mbtiles)
    --colorprop    Feature property to use for gray level (0-255), default='value'"
    --color        Single color to use on all pixels (overrides colorprop), default=''"
    --nodata       Colorprop value to interpret as nodata (will not be rendered), default=255"
    --antialias    Control anti-aliasing (none/default/gray/subpixel), default='default'"
    --zoomlevel    Upper limit on zoom level to rasterize (0-99), default=highest in input file"
    --bitmapsize   Width/Height of the created rasters, default = 256
    --png          Export as individual png files rather than .mbtiles archive"

	Examples
	  $ rasterize-vector-tiles -i vector.mbtiles -o raster.mbtiles -prop value
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
      color: {
        type: "string"
      },
      nodata: {
        type: "number",
        default: -1
      },
      antialias: {
        type: "string",
        default: "default"
      },
      zoomlevel: {
        type: "number",
        alias: "zoom",
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
);

log.debug(cli);

const option = cli.flags;
log.info(
  "Feature property controlling color: " + option.colorprop || "<empty>"
);
log.info("Nodata value (ignored features):    " + option.nodata);
log.info("Constant color for all geometries:  " + option.color);
log.info("Antialiasing mode:                  " + option.antialias);
log.info("Source file:                        " + option.source);
log.info("Target file:                        " + option.target);
log.info(
  "Target bitmap size:                 " +
    option.bitmapsize +
    " x " +
    option.bitmapsize
);
if (!option.source) error("Error: Source file argument (-i) is required.");
if (!option.target) error("Error: Target file argument (-o) is required.");

function error(msg) {
  console.error(msg);
  process.exitCode = 1;
  process.exit();
}

async function readSource() {
  log.info(`Reading '${option.source}'`);
  const source = await listFiles(option.source, option.zoomlevel);
  source.metadata = await readMetadata(option.source);
  log.info("Source tile count: " + source.files.length);
  return source;
}

async function rasterize(files, targetdb) {
  const start = new Date();
  for (let i = 0; i < files.length; ) {
    await rasterizeTile(files[i], targetdb);
    i++;
    printProgress(start, i, files.length);
  }
  targetdb.close();
}

async function rasterizeTile(vtile, targetdb) {
  const pbfjson = decodePbf(vtile.tile_data);
  const imageBuffer = render(pbfjson, option);
  const { zoom_level, tile_column, tile_row } = vtile;
  await targetdb.createTile(zoom_level, tile_column, tile_row, imageBuffer);
}

async function convert() {
  const source = await readSource();
  log.info(`Creating '${option.target}'`);
  const targetdb = await target.create(source, option.png, option.target);
  await rasterize(source.files, targetdb);
}

convert().then((reject, resolve) => {
  if (reject) throw new Error(reject);
});
