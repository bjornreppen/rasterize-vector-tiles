const getFormatSettings = require("./tileformat");

test("png", () => {
  expect(getFormatSettings("png")).toMatchSnapshot();
});

test("jpg", () => {
  expect(getFormatSettings("jpg")).toMatchSnapshot();
});

test("pbf", () => {
  expect(getFormatSettings("pbf")).toMatchSnapshot();
});

test("unknown", () => {
  expect(getFormatSettings("unknown")).toMatchSnapshot();
});
