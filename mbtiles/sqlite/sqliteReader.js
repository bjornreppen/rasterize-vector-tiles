const log = require("../../log")
const { safe, dball } = require("../../sqlite")

async function listRows(file, table, fields) {
  const lastField = fields.slice(-1)[0]
  return await dball(
    file,
    `SELECT ${fields[0]} AS name, length(${lastField}) AS size FROM ${safe(
      table
    )} LIMIT 100`
  )
}

// List all non-system tables in the database
async function listTables(file, filter) {
  return await dball(
    file,
    "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY 1"
  )
}

// Retrieve an array containing the column names in the table
async function getColumns(file, table) {
  const records = await dball(file, `PRAGMA table_info('${safe(table)}')`)
  return records.map(rec => rec.name)
}

async function read(file, table, keys, columns) {
  log.info(`Read key ${keys} from ${table} in file ${file}`)
  const rows = await dball(
    file,
    `SELECT ${columns.join(",")} from ${safe(table)} WHERE ${whereClause(
      columns,
      keys.length
    )}`,
    keys
  )
  if (rows.length <= 0) return null
  const row = rows[0]
  return Object.values(row)[keys.length]
}

function whereClause(columns, count) {
  return columns
    .slice(0, count)
    .map(col => col + "=?")
    .join(" AND ")
}

module.exports = { listTables, getColumns, listRows, read }
