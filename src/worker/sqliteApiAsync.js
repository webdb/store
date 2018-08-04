import functionExports from './exports';
import { createModule } from '../../lib/built/module';

import wasmBinaryAsync from '../../lib/built/module.wasm';

export default new Promise(async resolve =>
  createModule({
    wasmBinary: await wasmBinaryAsync,
    onRuntimeInitialized() {
      resolve(
        Object.entries(functionExports).reduce(
          (api, [funcName, [returnType, argTypes, aliasedFuncName]]) => {
            api[funcName] = this.cwrap(
              aliasedFuncName || funcName,
              returnType,
              argTypes
            );
            return api;
          },
          { ...this }
        )
      );
    }
  })
);
