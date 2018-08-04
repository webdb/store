// eslint-disable-next-line
import { createFilter } from 'rollup-pluginutils';
import { readFileSync } from 'fs';
import { rollup } from 'rollup';
import wasm from "./wasm-plugin";

const banner = readFileSync(`${__dirname}/scripts/worker-banner.js`, 'utf8');

export default function worker({ include = '**/*.worker.js', exclude } = {}) {
  const filter = createFilter(include, exclude);
  return {
    name: 'worker',
    banner,
    load(id) {
      if (filter(id)) {
        return (async () => {
          const bundle = await rollup({
            input: id,
            plugins: [wasm()]
          });
          const { code, map } = await bundle.generate({sourcemap: true, format: 'es' });
          return {
            code: `export default createWorker(()=>{${code}});`,
            map
          }
        })();
      }
    }
  };
}