import { Database } from "../../src/api/index";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;

it("database", async () => {
  let db = new Database();

  // Execute some sql
  let sqlstr = "CREATE TABLE test (a, b, c, d, e);";
  let res = await db.exec(sqlstr);
  expect(res).toEqual([], "Creating a table should not return anything");

  await db.run("INSERT INTO test VALUES (NULL, 42, 4.2, 'fourty two', x'42');");

  // Retrieving values
  sqlstr = "SELECT * FROM test;";
  res = await db.exec(sqlstr);
  const expectedResult = [
    {
      columns: ["a", "b", "c", "d", "e"],
      values: [[null, 42, 4.2, "fourty two", new Uint8Array([0x42])]]
    }
  ];
  expect(res).toEqual(expectedResult, "await db.exec() return value");

  // Export the database to an Uint8Array containing the SQLite database file
  const binaryArray = await db.export();
  expect(String.fromCharCode.apply(null, binaryArray.subarray(0, 6))).toEqual(
    "SQLite",
    "The first 6 bytes of an SQLite database should form the word 'SQLite'"
  );
  await db.close();

  const db2 = new Database(binaryArray);
  const result = await db2.exec("SELECT * FROM test");
  expect(result).toEqual(
    expectedResult,
    "Exporting and re-importing the database should lead to the same database"
  );
  await db2.close();

  db = new Database();
  expect(await db.exec("SELECT * FROM sqlite_master")).toEqual(
    [],
    "Newly created databases should be empty"
  );
  // Testing await db.each
  await db.run(
    "CREATE TABLE test (a,b); INSERT INTO test VALUES (1,'a'),(2,'b')"
  );
  let count = 0;
  let finished = false;
  await db.each(
    "SELECT * FROM test ORDER BY a",
    row => {
      count++;
      if (count === 1) {
        expect(row).toEqual(
          { a: 1, b: "a" },
          "await db.each returns the correct 1st row"
        );
      }
      if (count === 2) {
        expect(row).toEqual(
          { a: 2, b: "b" },
          "await db.each returns the correct 2nd row"
        );
      }
    },
    () => {
      finished = true;
      expect(count).toEqual(
        2,
        "await db.each returns the right number of rows"
      );
    }
  );

  return new Promise(r => {
    setTimeout(() => {
      expect(finished).toEqual(
        true,
        "await db.each should call its last callback after having returned the rows"
      );
      r();
    }, 3000);
  });
});
