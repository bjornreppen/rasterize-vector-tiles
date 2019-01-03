const log = require("log-less-fancy")();
const fs = require("fs");

const formats = {
  pbf: {
    contentType: "application/x-protobuf",
    extension: "pbf"
  },
  png: { contentType: "image/png", extension: "png" },
  jpg: { contentType: "image/jpg", extension: "jpg" }
};

// Add replacements for missing tiles to avoid 404 errors
Object.keys(formats).forEach(format => {
  formats[format].emptyFile = fs.readFileSync("./static/empty." + format);
});

function getFormatSettings(formatstring) {
  const format = formats[formatstring];
  if (format) return format;
  log.warn(
    "Unknown mbtiles format specified in metadata table: " + formatstring
  );
  return {};
}

module.exports = getFormatSettings;
