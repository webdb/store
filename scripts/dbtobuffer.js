const { readFileSync, writeFileSync } = require("fs");
const filebuffer = readFileSync(`${__dirname}/issue55.db`);
writeFileSync(
  `${__dirname}/db.js`,
  `export default new Uint8Array([${Array.from(filebuffer)}]);`,
  { encoding: "utf8" }
);
