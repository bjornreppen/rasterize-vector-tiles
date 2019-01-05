var log = require("../log")
const { dball } = require("./sqlite/sqlite")

async function readTile(file, zoom, column, row) {
  let dbRow = Math.pow(2, zoom) - 1 - row
  log.info(`Read tile ${zoom},${column},${dbRow} from ${file}`)
  const sql =
    "SELECT tile_data from tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?"
  const records = await dball(file, sql, [zoom, column, dbRow])
  if (records.length !== 1) return null
  const record = records[0]
  return record && record.tile_data
}

async function readMetadata(file) {
  const sql = "SELECT name, value from metadata"
  const records = await dball(file, sql)
  const meta = records.reduce((acc, row) => {
    acc[row.name] = row.value
    return acc
  }, {})
  return meta
}

async function listFiles(file, maxzoom) {
  const r = await dball(file, "SELECT MAX(zoom_level) AS zoom FROM tiles")
  const zoom = Math.min(r[0].zoom, maxzoom)
  log.info("Rasterizing zoom level " + zoom)
  const sql =
    "SELECT zoom_level, tile_column, tile_row, tile_data FROM tiles WHERE zoom_level=?"
  const files = await dball(file, sql, [zoom])
  return { zoomlevel: zoom, files }
}

module.exports = { readTile, readMetadata, listFiles }
