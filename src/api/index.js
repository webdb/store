// eslint-disable-next-line
import DbWorker from '../worker/index.worker.js';
import { proxy } from '../../lib/comlink/comlink';

const {
  constructDatabase,
  execDatabase,
  runDatabase,
  exportDatabase,
  closeDatabase,
  prepareDatabase,
  getRowsModifiedDatabase,
  bindStatement,
  freeStatement,
  runStatement,
  stepStatement,
  getStatement,
  getAsObjectStatement,
  getColumnNamesStatement
} = proxy(DbWorker);

class Statement {
  constructor(proxyData, db) {
    this.db = db;
    this.proxyData = proxyData;
  }
  get key() {
    return this.proxyData.stmt;
  }
  run(...args) {
    return this.proxyCall(runStatement, ...args);
  }
  step(...args) {
    return this.proxyCall(stepStatement, ...args);
  }
  get(...args) {
    return this.proxyCall(getStatement, ...args);
  }
  bind(...args) {
    return this.proxyCall(bindStatement, ...args);
  }
  getAsObject(...args) {
    return this.proxyCall(getAsObjectStatement, ...args);
  }
  free(...args) {
    return this.proxyCall(freeStatement, ...args);
  }
  getColumnNames(...args) {
    return this.proxyCall(getColumnNamesStatement, ...args);
  }
  async proxyCall(asyncFunc, ...args) {
    const returnValue = await asyncFunc(this.proxyData, ...args);

    // eslint-disable-next-line
    switch (returnValue && returnValue.__type) {
      case 'stmt':
        Object.assign(this.proxyData, returnValue);
        return this;
      case 'db':
        Object.assign(await this.db.deferredProxyData, returnValue);
        return this.db;
      default:
        return returnValue;
    }
  }
}

export class Database {
  constructor(...constructArgs) {
    this.statements = {};
    this.deferredProxyData = constructDatabase(...constructArgs);
  }
  freeAllStatements() {
    const oldStatements = this.statements;
    this.statements = {};
    return Promise.all(Object.values(oldStatements).map(stmt => stmt.free()));
  }
  exec(...args) {
    return this.proxyCall(execDatabase, ...args);
  }
  run(...args) {
    return this.proxyCall(runDatabase, ...args);
  }
  async export(...args) {
    await this.freeAllStatements();
    return this.proxyCall(exportDatabase, ...args);
  }
  async close(...args) {
    await this.freeAllStatements();
    return this.proxyCall(closeDatabase, ...args);
  }
  async each(sql, params, cb, done) {
    if (typeof params === 'function') {
      done = cb;
      cb = params;
      params = undefined;
      done = done || (() => null);
    }
    const stmt = await this.prepare(sql, params);
    while (await stmt.step()) {
      await cb(await stmt.getAsObject());
    }
    await stmt.free();
    return done();
  }
  prepare(...args) {
    return this.proxyCall(prepareDatabase, ...args);
  }
  getRowsModified(...args) {
    return this.proxyCall(getRowsModifiedDatabase, ...args);
  }
  async proxyCall(asyncFunc, ...args) {
    const proxyData = await this.deferredProxyData;

    const returnValue = await asyncFunc(proxyData, ...args);

    // eslint-disable-next-line
    switch (returnValue && returnValue.__type) {
      // eslint-disable-next-line
      case 'stmt':
        const stmt = new Statement(returnValue, this);
        this.statements[stmt.key] = stmt;
        return stmt;
      case 'db':
        Object.assign(proxyData, returnValue);
        return this;
      default:
        return returnValue;
    }
  }
}
