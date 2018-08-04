import { expose } from "../../lib/comlink/comlink";
import {
  constructDatabase,
  runDatabase,
  execDatabase,
  prepareDatabase,
  exportDatabase,
  closeDatabase,
  getRowsModifiedDatabase
} from "./database";

import {
  bindStatement,
  stepStatement,
  getStatement,
  freeStatement,
  getAsObjectStatement,
  runStatement,
  getColumnNamesStatement
} from "./statement";

expose(
  {
    constructDatabase,
    runDatabase,
    execDatabase,
    prepareDatabase,
    exportDatabase,
    getRowsModifiedDatabase,
    bindStatement,
    stepStatement,
    getStatement,
    freeStatement,
    getAsObjectStatement,
    getColumnNamesStatement,
    runStatement,
    closeDatabase
  },
  self
);
