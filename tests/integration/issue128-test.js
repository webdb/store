import { Database } from "../../src/api/index";

// https://github.com/kripken/sql.js/issues/128

it("issue128", async () => {
  const db = new Database();

  await db.run("CREATE TABLE test (data TEXT);");

  await db.exec("SELECT * FROM test;");
  expect(await db.getRowsModified()).toEqual(
    0,
    "getRowsModified returns 0 at first"
  );

  await db.exec("INSERT INTO test VALUES ('Hello1');");
  await db.exec("INSERT INTO test VALUES ('Hello');");
  await db.exec("INSERT INTO test VALUES ('Hello');");
  await db.exec("INSERT INTO test VALUES ('World4');");
  expect(await db.getRowsModified()).toEqual(
    1,
    "getRowsModified works for inserts"
  );

  await db.exec("UPDATE test SET data = 'World4' where data = 'Hello';");
  expect(await db.getRowsModified()).toEqual(
    2,
    "getRowsModified works for updates"
  );

  await db.exec("DELETE FROM test;");
  expect(await db.getRowsModified()).toEqual(
    4,
    "getRowsModified works for deletes"
  );

  await db.exec("SELECT * FROM test;");
  expect(await db.getRowsModified()).toEqual(
    4,
    "getRowsModified unmodified by queries"
  );
});
