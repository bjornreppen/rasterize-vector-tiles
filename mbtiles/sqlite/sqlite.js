const log = require("../../log")
const sqlite3 = require("sqlite3")
const fs = require("fs")
var path = require("path")

// Strip injection unsafe characters from argument
function safe(arg) {
  return arg.replace(/[^0-9a-z_%\-]/gi, "")
}

function writeExec(db, sql) {
  log.debug("SQL   : " + sql)
  return new Promise((resolve, reject) => {
    db.exec(sql, (err, records) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

function writedb(db, sql, args = []) {
  log.debug("SQL   : " + sql)
  return new Promise((resolve, reject) => {
    db.run(sql, args, err => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

function dball(file, sql, args = []) {
  log.info("Open " + file)
  log.debug("SQL   : " + sql)
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err)
      db.all(sql, args, (err, records) => {
        db.close()
        if (err) return reject(err)
        return resolve(records)
      })
    })
  })
}

module.exports = { safe, dball, writeExec, writedb }
