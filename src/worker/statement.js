import Constants from './constants';
import apiAsync from './sqliteApiAsync';

const ALLOC_NORMAL = 0;

/* eslint-disable */
function constructRange(left, right, inclusive) {
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
/* eslint-enable */

export const NULL = 0;

export async function handleError({ db }, returnCode) {
  const { sqlite3_errmsg } = await apiAsync;
  if (returnCode === Constants.OK) {
    return null;
  }
  const errmsg = sqlite3_errmsg(db);
  throw new Error(errmsg);
}

export async function constructStatement(stmt, db) {
  return {
    stmt,
    pos: 1,
    allocatedmem: [],
    db,
    __type: 'stmt'
  };
}

export async function getNumberStatement(statement, pos) {
  const { sqlite3_column_double } = await apiAsync;
  if (pos == null) {
    pos = statement.pos++;
  }
  return sqlite3_column_double(statement.stmt, pos);
}

export async function getStringStatement(statement, pos) {
  const { sqlite3_column_text } = await apiAsync;
  if (pos == null) {
    pos = statement.pos++;
  }
  return sqlite3_column_text(statement.stmt, pos);
}

export async function getBlobStatement(statement, pos) {
  const { sqlite3_column_bytes, sqlite3_column_blob, HEAP8 } = await apiAsync;
  if (pos == null) {
    pos = statement.pos++;
  }
  const size = sqlite3_column_bytes(statement.stmt, pos);
  const ptr = sqlite3_column_blob(statement.stmt, pos);
  const result = new Uint8Array(size);
  for (
    let i = 0, end = size, asc = end >= 0;
    asc ? i < end : i > end;
    asc ? i++ : i--
  ) {
    result[i] = HEAP8[ptr + i];
  }
  return result;
}

export async function stepStatement(statement) {
  const { sqlite3_step } = await apiAsync;
  let ret;
  const { stmt } = statement;
  if (!stmt) {
    throw new Error('Statement closed');
  }
  statement.pos = 1;
  switch ((ret = sqlite3_step(stmt))) {
    case Constants.ROW:
      return true;
    case Constants.DONE:
      return false;
    default:
      return handleError(statement, ret);
  }
}

async function resetStatement(statement) {
  const { sqlite3_clear_bindings, sqlite3_reset, _free } = await apiAsync;

  statement.allocatedmem.forEach(m => _free(m));
  statement.allocatedmem = [];

  return (
    sqlite3_clear_bindings(statement.stmt) === Constants.OK &&
    sqlite3_reset(statement.stmt) === Constants.OK
  );
}

async function bindStringStatement(statement, string, pos) {
  const { intArrayFromString, allocate, sqlite3_bind_text } = await apiAsync;
  let strptr;
  if (pos == null) {
    pos = statement.pos++;
  }
  const bytes = intArrayFromString(string);
  statement.allocatedmem.push((strptr = allocate(bytes, 'i8', ALLOC_NORMAL)));
  await handleError(
    statement,
    sqlite3_bind_text(statement.stmt, pos, strptr, bytes.length - 1, 0)
  );
  return true;
}

async function bindBlobStatement(statement, array, pos) {
  const { sqlite3_bind_blob, allocate } = await apiAsync;
  let blobptr;
  if (pos == null) {
    pos = statement.pos++;
  }
  statement.allocatedmem.push((blobptr = allocate(array, 'i8', ALLOC_NORMAL)));
  await handleError(
    statement,
    sqlite3_bind_blob(statement.stmt, pos, blobptr, array.length, 0)
  );
  return true;
}

async function bindNumberStatement(statement, num, pos) {
  const { sqlite3_bind_int, sqlite3_bind_double } = await apiAsync;
  if (pos == null) {
    pos = statement.pos++;
  }
  const bindfunc = num === (num | 0) ? sqlite3_bind_int : sqlite3_bind_double;
  await handleError(statement, bindfunc(statement.stmt, pos, num));
  return true;
}

async function bindNullStatement(statement, pos) {
  const { sqlite3_bind_blob } = await apiAsync;
  if (pos == null) {
    pos = statement.pos++;
  }
  return sqlite3_bind_blob(statement.stmt, pos, 0, 0, 0) === Constants.OK;
}

async function bindValueStatement(statement, val, pos) {
  if (pos == null) {
    pos = statement.pos++;
  }
  switch (typeof val) {
    case 'string':
      return bindStringStatement(statement, val, pos);
    case 'number':
    case 'boolean':
      return bindNumberStatement(statement, val + 0, pos);
    case 'object':
      if (val === null) {
        return bindNullStatement(statement, pos);
      } else if (val.length != null) {
        return bindBlobStatement(statement, val, pos);
      }
    // eslint-disable-next-line
    default:
      throw new Error(
        `Wrong API use : tried to bind a value of an unknown type (${val}).`
      );
  }
}

async function bindFromObjectStatemet(statement, valuesObj) {
  const { sqlite3_bind_parameter_index } = await apiAsync;
  // eslint-disable-next-line
  for (const name in valuesObj) {
    const value = valuesObj[name];
    const num = sqlite3_bind_parameter_index(statement.stmt, name);
    if (num !== 0) {
      // eslint-disable-next-line
      await bindValueStatement(statement, value, num);
    }
  }
  return true;
}

async function bindFromArrayStatement(statement, values) {
  for (let num = 0; num < values.length; num++) {
    const value = values[num];
    // eslint-disable-next-line
    await bindValueStatement(statement, value, num + 1);
  }
  return true;
}

export async function bindStatement(statement, values) {
  if (!statement.stmt) {
    throw new Error('Statement closed');
  }
  await resetStatement(statement);
  if (Array.isArray(values)) {
    return bindFromArrayStatement(statement, values);
  }
  return bindFromObjectStatemet(statement, values);
}

export async function getStatement(statement, params) {
  const { sqlite3_data_count, sqlite3_column_type } = await apiAsync;
  // Get all fields
  const { stmt } = statement;
  if (params != null && (await bindStatement(statement, params))) {
    await stepStatement(statement);
  }

  const result = [];
  for (
    let field = 0, end = sqlite3_data_count(stmt), asc = end >= 0;
    asc ? field < end : field > end;
    asc ? field++ : field--
  ) {
    switch (sqlite3_column_type(stmt, field)) {
      case Constants.INTEGER:
      case Constants.FLOAT:
        result.push(await getNumberStatement(statement, field));
        break;
      case Constants.TEXT:
        result.push(await getStringStatement(statement, field));
        break;
      case Constants.BLOB:
        result.push(await getBlobStatement(statement, field));
        break;
      default:
        result.push(null);
    }
  }
  return result;
}

export async function freeStatement(statement) {
  const { sqlite3_finalize, _free } = await apiAsync;
  statement.allocatedmem.forEach(m => _free(m));
  statement.allocatedmem = [];

  await handleError(statement, sqlite3_finalize(statement.stmt));
  statement.stmt = NULL;
  return statement;
}

export async function getColumnNamesStatement({ stmt }) {
  const { sqlite3_data_count, sqlite3_column_name } = await apiAsync;
  return constructRange(0, sqlite3_data_count(stmt), false).map(i =>
    sqlite3_column_name(stmt, i)
  );
}

export async function getAsObjectStatement(statement, params) {
  const values = await getStatement(statement, params);
  const names = await getColumnNamesStatement(statement);
  const rowObject = {};
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    rowObject[name] = values[i];
  }
  return rowObject;
}

export async function runStatement(statement, values) {
  if (values != null) {
    await bindStatement(statement, values);
  }
  await stepStatement(statement);
  return resetStatement(statement);
}
