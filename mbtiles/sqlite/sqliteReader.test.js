const reader = require("./sqliteReader");

test("listTables", () => {
  return reader
    .listTables("./testdata/test.sqlite")
    .then(tables => expect(tables).toMatchSnapshot());
});

test("listTables missing file", () => {
  return reader
    .listTables("./testdata/missing.sqlite")
    .catch(err => expect(err).toMatchSnapshot());
});

test("getColumns", () => {
  return reader
    .getColumns("./testdata/test.sqlite", "threecolumns")
    .then(columns => expect(columns).toMatchSnapshot());
});

test("listRows", () => {
  return reader
    .listRows("./testdata/test.sqlite", "threecolumns", ["col2", "col3"])
    .then(value => expect(value).toMatchSnapshot());
});

test("read", () => {
  return reader
    .read(
      "./testdata/test.sqlite",
      "threecolumns",
      [1, "a"],
      ["col1", "col2", "col3"]
    )
    .then(value => expect(value).toMatchSnapshot());
});
test("read missing", () => {
  return reader
    .read(
      "./testdata/test.sqlite",
      "threecolumns",
      [4],
      ["col1", "col2", "col3"]
    )
    .then(value => expect(value).toMatchSnapshot());
});

test("read invalid tablename", () => {
  return reader
    .read("./testdata/test.sqlite", "missingtable", [4], ["col1"])
    .catch(err => expect(err).toMatchSnapshot());
});
