let lastUpdate = 0

// Updates the single line progress indicator on screen

function printprogress(start, tilesComplete, totalTiles) {
  const now = new Date()
  if (now - lastUpdate < 1000) return // Update frequency < once per second
  const elapsedMs = new Date() - start
  const progress = (100 * tilesComplete) / totalTiles
  const remainMs = (elapsedMs / tilesComplete) * (totalTiles - tilesComplete)
  const tilespersec = (tilesComplete / elapsedMs) * 1000
  const est = new Date(Date.now() + remainMs)
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(
    `${tilesComplete}/${totalTiles} (${progress.toFixed(
      2
    )}%)\t${tilespersec.toFixed(
      2
    )} tiles/sec\t Completion est: ${est.toLocaleTimeString()}`
  )
  lastUpdate = now
}

module.exports = printprogress
