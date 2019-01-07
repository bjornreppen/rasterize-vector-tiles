const log = require("../log")
const { writeExec, writedb } = require("./sqlite/sqlite")
const fs = require("fs")
const sqlite3 = require("sqlite3")
const path = require("path")

async function writeTile(db, zoom, column, row, buffer) {
  log.debug(`Write tile ${zoom},${column},${row}`)
  const sql = "INSERT INTO tiles VALUES (?,?,?,?);"
  await writedb(db, sql, [zoom, column, row, buffer])
}

function open(file, flags = sqlite3.OPEN_READWRITE) {
  return new sqlite3.Database(file, flags, err => {
    if (err) throw new Error(err)
  })
}

async function createMbtile(file, metadata) {
  if (fs.existsSync(file)) fs.unlinkSync(file)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const db = open(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
  await writeExec(db, "CREATE TABLE metadata (name text, value text);")
  await writeExec(
    db,
    "CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob);"
  )

  Object.keys(metadata).forEach(key => {
    const value = metadata[key]
    writedb(db, "INSERT INTO metadata VALUES (?,?)", [key, value])
  })

  return db
}

async function createIndex(db) {
  await writeExec(
    db,
    "CREATE UNIQUE INDEX tile_index on tiles (zoom_level, tile_column, tile_row);"
  )
}

module.exports = { open, writeTile, createMbtile, createIndex }
