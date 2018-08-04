import { Database } from "../../src/api/index";

it("transactions", async () => {
  const db = new Database();
  await db.exec("CREATE TABLE test (data); INSERT INTO test VALUES (1);");

  // Open a transaction
  await db.exec("BEGIN TRANSACTION;");

  // Insert a row
  await db.exec("INSERT INTO test VALUES (4);");

  // Rollback
  await db.exec("ROLLBACK;");

  let res = await db.exec("SELECT data FROM test WHERE data = 4;");
  let expectedResult = [];
  expect(res).toEqual(expectedResult, "transaction rollbacks work");

  // Open a transaction
  await db.exec("BEGIN TRANSACTION;");

  // Insert a row
  await db.exec("INSERT INTO test VALUES (4);");

  // Commit
  await db.exec("COMMIT;");

  res = await db.exec("SELECT data FROM test WHERE data = 4;");
  expectedResult = [
    {
      columns: ["data"],
      values: [[4]]
    }
  ];
  expect(res).toEqual(expectedResult, "transaction commits work");

  // Open a transaction
  await db.exec("BEGIN TRANSACTION;");

  // Insert a row
  await db.exec("INSERT INTO test VALUES (5);");

  // Rollback
  await db.exec("ROLLBACK;");

  res = await db.exec("SELECT data FROM test WHERE data IN (4,5);");
  expectedResult = [
    {
      columns: ["data"],
      values: [[4]]
    }
  ];
  expect(res).toEqual(
    expectedResult,
    "transaction rollbacks after commits work"
  );

  await db.close();
});
