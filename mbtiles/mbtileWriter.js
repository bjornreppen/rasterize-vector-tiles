const log = require("log-less-fancy")()
const { writeExec, writedb } = require("./sqlite/sqlite")
const fs = require("fs")
const sqlite3 = require("sqlite3")

async function writeTile(db, zoom, column, row, buffer) {
  log.debug(`Write tile ${zoom},${column},${row}`)
  const sql = "INSERT INTO tiles VALUES (?,?,?,?);"
  await writedb(db, sql, [zoom, column, row, buffer])
}

async function createMbtile(file, metadata) {
  if (fs.existsSync(file)) fs.unlinkSync(file)
  const db = new sqlite3.Database(
    file,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    err => {
      if (err) throw new Error(err)
    }
  )

  await writeExec(db, "CREATE TABLE metadata (name text, value text);")
  await writeExec(
    db,
    "CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob);"
  )
  await writeExec(
    db,
    "CREATE UNIQUE INDEX tile_index on tiles (zoom_level, tile_column, tile_row);"
  )

  Object.keys(metadata).forEach(key => {
    const value = metadata[key]
    writedb(db, "INSERT INTO metadata VALUES (?,?)", [key, value])
  })

  return db
}

module.exports = { writeTile, createMbtile }
