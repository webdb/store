import Constants from './constants';
import apiAsync from './sqliteApiAsync';

import {
  NULL,
  handleError,
  constructStatement,
  bindStatement,
  stepStatement,
  freeStatement,
  getColumnNamesStatement,
  getStatement
} from './statement';

export async function constructDatabase(data) {
  const {
    FS,
    stackAlloc,
    getValue,
    RegisterExtensionFunctions,
    sqlite3_open
  } = await apiAsync;

  const statements = {};
  const apiTemp = stackAlloc(4);
  const filename = `dbfile_${(0xffffffff * Math.random()) >>> 0}`;
  if (data) {
    FS.createDataFile('/', filename, data, true, true);
  }
  await handleError({}, sqlite3_open(filename, apiTemp));
  const db = getValue(apiTemp, 'i32');

  RegisterExtensionFunctions(db);

  return {
    statements,
    apiTemp,
    filename,
    db,
    __type: 'db'
  };
}

export async function prepareDatabase(database, sql, params) {
  const { setValue, getValue, sqlite3_prepare_v2 } = await apiAsync;
  const { db, apiTemp } = database;
  setValue(apiTemp, 0, 'i32');
  await handleError(database, sqlite3_prepare_v2(db, sql, -1, apiTemp, NULL));
  const pStmt = getValue(apiTemp, 'i32'); //  pointer to a statement, or null
  if (pStmt === NULL) {
    throw new Error('Nothing to prepare');
  }
  const statement = await constructStatement(pStmt, db);
  if (params != null) {
    await bindStatement(statement, params);
  }
  return statement;
}

export async function runDatabase(database, sql, params) {
  const { sqlite3_exec } = await apiAsync;
  const { db, apiTemp } = database;
  if (!db) {
    throw new Error('Database closed');
  }
  if (params) {
    const statement = await prepareDatabase(database, sql, params);
    await stepStatement(statement);
    await freeStatement(statement);
  } else {
    await handleError(database, sqlite3_exec(db, sql, 0, 0, apiTemp));
  }
  return database;
}

export async function execDatabase(database, sql) {
  const {
    stackAlloc,
    getValue,
    setValue,
    stackSave,
    stackRestore,
    lengthBytesUTF8,
    stringToUTF8,
    sqlite3_prepare_v2_sqlptr
  } = await apiAsync;

  const { db, apiTemp } = database;
  if (!db) {
    throw new Error('Database closed');
  }

  const stack = stackSave();
  // Store the SQL string in memory. The string will be consumed, one statement
  // at a time, by sqlite3_prepare_v2_sqlptr.
  // Allocate at most 4 bytes per UTF8 char, +1 for the trailing '\0'
  let nextSqlPtr = stackAlloc(sql.length << (2 + 1));
  const lengthBytes = lengthBytesUTF8(sql) + 1;
  stringToUTF8(sql, nextSqlPtr, lengthBytes + 1);

  // Used to store a pointer to the next SQL statement in the string
  const pzTail = stackAlloc(4);

  const results = [];
  while (getValue(nextSqlPtr, 'i8') !== NULL) {
    setValue(apiTemp, 0, 'i32');
    setValue(pzTail, 0, 'i32');
    // eslint-disable-next-line
    await handleError(
      database,
      sqlite3_prepare_v2_sqlptr(db, nextSqlPtr, -1, apiTemp, pzTail)
    );
    const pStmt = getValue(apiTemp, 'i32'); //  pointer to a statement, or null
    nextSqlPtr = getValue(pzTail, 'i32');
    if (pStmt === NULL) {
      // eslint-disable-next-line
      continue;
    } // Empty statement

    const statement = await constructStatement(pStmt, db);
    let curresult = null;
    while (await stepStatement(statement)) {
      if (curresult === null) {
        curresult = {
          columns: await getColumnNamesStatement(statement),
          values: []
        };
        results.push(curresult);
      }
      const value = await getStatement(statement);
      curresult.values.push(value);
    }

    await freeStatement(statement);
  }
  stackRestore(stack);
  return results;
}

export async function exportDatabase(database) {
  const { getValue, FS, sqlite3_close_v2, sqlite3_open } = await apiAsync;
  handleError(database, sqlite3_close_v2(database.db));
  const binaryDb = FS.readFile(database.filename, { encoding: 'binary' });
  handleError(database, sqlite3_open(database.filename, database.apiTemp));
  database.db = getValue(database.apiTemp, 'i32');
  return binaryDb;
}

export async function closeDatabase(database) {
  const { FS, sqlite3_close_v2 } = await apiAsync;
  await handleError(database, sqlite3_close_v2(database.db));
  FS.unlink(`/${database.filename}`);
  database.db = null;
  return database;
}

export async function getRowsModifiedDatabase(database) {
  const { sqlite3_changes } = await apiAsync;
  return sqlite3_changes(database.db);
}
