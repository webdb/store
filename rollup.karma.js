// eslint-disable-next-line
import multiEntry from "rollup-plugin-multi-entry";
// eslint-disable-next-line
import worker from "./scripts/worker-plugin";

export default [
  {
    input: {
      include: ["tests/**/*-test.js"]
    },
    output: [{ file: "tmp/index.js", sourcemap: true, format: "es" }],
    plugins: [multiEntry(), worker()]
  }
];
