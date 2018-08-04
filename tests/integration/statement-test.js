import { Database } from "../../src/api/index";

it("statement", async () => {
  const db = new Database();

  // Execute some sql
  const sqlstr = "CREATE TABLE alphabet (letter, code);";
  await db.exec(sqlstr);

  let result = await db.exec(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  expect(result).toEqual(
    [{ columns: ["name"], values: [["alphabet"]] }],
    "Table properly created"
  );

  // Prepare a statement to insert values in tha database
  let stmt = await db.prepare(
    "INSERT INTO alphabet (letter,code) VALUES (?,?)"
  );
  // Execute the statement several times
  await stmt.run(["a", 1]);
  await stmt.run(["b", 2.2]);
  await stmt.run(["c"]); // The second parameter will be bound to NULL

  // Free the statement
  await stmt.free();

  result = await db.exec("SELECT * FROM alphabet");
  expect(result).toEqual(
    [
      {
        columns: ["letter", "code"],
        values: [["a", 1], ["b", 2.2], ["c", null]]
      }
    ],
    "Statement.run() should have added data to the database"
  );

  await db.run(
    "CREATE TABLE data (nbr, str, nothing); INSERT INTO data VALUES (5, '粵語😄', NULL);"
  );
  stmt = await db.prepare("SELECT * FROM data");
  await stmt.step(); // Run the statement
  expect(await stmt.getColumnNames()).toEqual(
    ["nbr", "str", "nothing"],
    "Statement.GetColumnNames()"
  );
  const res = await stmt.getAsObject();
  expect(res.nbr).toEqual(5, "Read number");
  expect(res.str).toEqual("粵語😄", "Read string");
  expect(res.nothing).toEqual(null, "Read null");
  expect(res).toEqual(
    { nbr: 5, str: "粵語😄", nothing: null },
    "Statement.getAsObject()"
  );
  await stmt.free();

  stmt = await db.prepare("SELECT str FROM data WHERE str=?");
  expect(await stmt.getAsObject(["粵語😄"])).toEqual(
    { str: "粵語😄" },
    "UTF8 support in prepared statements"
  );

  // Prepare an sql statement
  stmt = await db.prepare(
    "SELECT * FROM alphabet WHERE code BETWEEN :start AND :end ORDER BY code"
  );
  // Bind values to the parameters
  await stmt.bind([0, 256]);
  // Execute the statement
  await stmt.step();
  // Get one row of result
  result = await stmt.get();
  expect(result).toEqual(
    ["a", 1],
    "Binding named parameters by their position"
  );

  // Fetch the next row of result
  result = await stmt.step();
  expect(result).toEqual(true);
  result = await stmt.get();
  expect(result).toEqual(["b", 2.2], "Fetching the next row of result");

  // Reset and reuse at once
  result = await stmt.get([0, 1]);
  expect(result).toEqual(["a", 1], "Reset and reuse at once");

  // Pass objects to get() and bind() to use named parameters
  result = await stmt.get({ ":start": 1, ":end": 1 });
  expect(result).toEqual(["a", 1], "Binding named parameters");

  // Close the database and all associated statements
  await db.close();
});
