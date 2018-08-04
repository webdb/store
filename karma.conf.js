// eslint-disable-next-line
process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = config =>
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      { pattern: "tmp/index.js" },
      { pattern: "tmp/*.js.map", included: false }
    ],
    logLevel: config.LOG_INFO,
    browsers: ["HeadlessChrome"]
  });
