// eslint-disable-next-line
import multiEntry from "rollup-plugin-multi-entry";
// eslint-disable-next-line
import worker from "./scripts/worker-plugin";

export default [
  {
    input: {
      include: ["src/api/index.js"]
    },
    output: [{ file: "dist/index.js", sourcemap: true, format: "es" }],
    plugins: [multiEntry(), worker()]
  }
];
