// eslint-disable-next-line
import { createFilter } from 'rollup-pluginutils';
import { readFileSync } from 'fs';

const banner = readFileSync(`${__dirname}/scripts/wasm-banner.js`, 'utf8');

export default function wasm({ include = '**/*.wasm', exclude } = {}) {
  const filter = createFilter(include, exclude);
  return {
    name: 'wasm',
    banner,
    load(id) {
      if (filter(id)) {
        const buf = readFileSync(id);
        const src = buf.toString('base64');
        return {
          code: `export default b64ToArray('${src}');`,
          map: { mappings: '' }
        };
      }
    }
  };
}