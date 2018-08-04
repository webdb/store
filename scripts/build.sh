#!/bin/bash

set -e
set -x

mkdir -p dist lib/built

if [ ! -f lib/built/sqlite3.bc ]; then
  emcc \
    -s ASSERTIONS=1 \
    -O2 \
    -DSQLITE_OMIT_LOAD_EXTENSION \
    -DSQLITE_DISABLE_LFS \
    -DLONGDOUBLE_TYPE=double \
    -DSQLITE_THREADSAFE=0 \
    -DSQLITE_ENABLE_FTS3 \
    -DSQLITE_ENABLE_FTS3_PARENTHESIS \
    -o lib/built/sqlite3.bc \
    lib/sqlite/sqlite3.c;
fi

if [ ! -f lib/built/extension-functions.bc ]; then
  emcc \
    -s LINKABLE=1 \
    -s ASSERTIONS=1 \
    -O2 \
    -DSQLITE_OMIT_LOAD_EXTENSION \
    -DSQLITE_DISABLE_LFS \
    -DLONGDOUBLE_TYPE=double \
    -DSQLITE_THREADSAFE=0 \
    -DSQLITE_ENABLE_FTS3 \
    -DSQLITE_ENABLE_FTS3_PARENTHESIS  \
    -o lib/built/extension-functions.bc \
    lib/sqlite/extension-functions.c;
fi

FUNCTIONS=$(cat lib/support/functions.json | tr -d " \t\n\r" );
METHODS=$(cat lib/support/methods.json | tr -d " \t\n\r");

emcc \
  -s ASSERTIONS=1 \
  -O1 \
  --memory-init-file 0 \
  -s INLINING_LIMIT=50 \
  -s RESERVED_FUNCTION_POINTERS=64 \
  -s WASM=1 \
  -s FORCE_FILESYSTEM=1 \
  -s EXPORTED_FUNCTIONS=$FUNCTIONS \
  -s EXTRA_EXPORTED_RUNTIME_METHODS=$METHODS \
  -o lib/built/module.html \
  --pre-js lib/support/pre.js \
  --post-js lib/support/post.js \
  lib/built/{sqlite3,extension-functions}.bc

npm run format-built

