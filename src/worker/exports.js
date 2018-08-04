export default {
  sqlite3_open: ['number', ['string', 'number']],
  sqlite3_close_v2: ['number', ['number']],
  sqlite3_exec: ['number', ['number', 'string', 'number', 'number', 'number']],
  sqlite3_free: ['', ['number']],
  sqlite3_changes: ['number', ['number']],

  sqlite3_prepare_v2: ['number', ['number', 'string', 'number', 'number', 'number']],
  sqlite3_prepare_v2_sqlptr: [
    'number',
    ['number', 'number', 'number', 'number', 'number'],
    'sqlite3_prepare_v2',
  ],

  sqlite3_bind_text: ['number', ['number', 'number', 'number', 'number', 'number']],
  sqlite3_bind_blob: ['number', ['number', 'number', 'number', 'number', 'number']],
  sqlite3_bind_double: ['number', ['number', 'number', 'number']],
  sqlite3_bind_int: ['number', ['number', 'number', 'number']],
  sqlite3_bind_parameter_index: ['number', ['number', 'string']],

  sqlite3_step: ['number', ['number']],
  sqlite3_errmsg: ['string', ['number']],

  sqlite3_data_count: ['number', ['number']],
  sqlite3_column_double: ['number', ['number', 'number']],
  sqlite3_column_text: ['string', ['number', 'number']],
  sqlite3_column_blob: ['number', ['number', 'number']],
  sqlite3_column_bytes: ['number', ['number', 'number']],
  sqlite3_column_type: ['number', ['number', 'number']],
  sqlite3_column_name: ['string', ['number', 'number']],

  sqlite3_reset: ['number', ['number']],
  sqlite3_clear_bindings: ['number', ['number']],
  sqlite3_finalize: ['number', ['number']],

  sqlite3_create_function_v2: [
    'number',
    ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
  ],
  sqlite3_value_type: ['number', ['number']],
  sqlite3_value_bytes: ['number', ['number']],
  sqlite3_value_text: ['string', ['number']],
  sqlite3_value_int: ['number', ['number']],
  sqlite3_value_blob: ['number', ['number']],
  sqlite3_value_double: ['number', ['number']],
  sqlite3_result_double: ['', ['number', 'number']],
  sqlite3_result_null: ['', ['number']],
  sqlite3_result_text: ['', ['number', 'string', 'number', 'number']],
  RegisterExtensionFunctions: ['number', ['number']],
};
