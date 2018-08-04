import { Database } from "../../src/api/index";

it("errors", async () => {
  let db = new Database([1, 2, 3]);

  try {
    await db.exec("SELECT * FROM sqlite_master");
    expect(true).toBe(false, "should never get to this because of error");
  } catch (e) {
    expect(() => {
      throw e;
    }).toThrowError(
      Error,
      /not a database/,
      "Querying an invalid database should throw an error"
    );
  }

  // Create a database
  db = new Database();

  // Execute some sql
  await db.exec("CREATE TABLE test (a INTEGER PRIMARY KEY, b, c, d, e);");

  try {
    await db.exec("I ain't be no valid sql ...");
    expect(true).toBe(false, "should never get to this because of error");
  } catch (e) {
    expect(() => {
      throw e;
    }).toThrowError(
      Error,
      /syntax error/,
      "Executing invalid SQL should throw an error"
    );
  }

  try {
    await db.run("INSERT INTO test (a) VALUES (1)");
    await db.run("INSERT INTO test (a) VALUES (1)");
    expect(true).toBe(false, "should never get to this because of error");
  } catch (e) {
    expect(() => {
      throw e;
    }).toThrowError(
      Error,
      /UNIQUE constraint failed/,
      "Inserting two rows with the same primary key should fail"
    );
  }

  const stmt = await db.prepare("INSERT INTO test (a) VALUES (?)");

  try {
    await stmt.bind([1, 2, 3]);
    expect(true).toBe(false, "should never get to this because of error");
  } catch (e) {
    expect(() => {
      throw e;
    }).toThrowError(
      Error,
      /out of range/,
      "Binding too many parameters should throw an exception"
    );
  }

  try {
    await db.run("CREATE TABLE test (this,wont,work)");
    expect(true).toBe(false, "should never get to this because of error");
  } catch (e) {
    expect(() => {
      throw e;
    }).toThrowError(
      Error,
      /table .+ already exists/,
      "Trying to create a table with a name that is already used should throw an error"
    );
  }

  await stmt.run([2]);
  expect(await db.exec("SELECT a,b FROM test WHERE a=2")).toEqual(
    [{ columns: ["a", "b"], values: [[2, null]] }],
    "Previous errors should not have spoiled the statement"
  );

  await db.close();
  try {
    await stmt.run([3]);
    expect(true).toBe(false, "should never get to this because of error");
  } catch (e) {
    expect(() => {
      throw e;
    }).toThrowError(
      Error,
      "Statement closed",
      "Statements should'nt be able to execute after the database is closed"
    );
  }
});
