import { Database } from "../../src/api/index";

// https://github.com/kripken/sql.js/issues/76

it("issue76", async () => {
  const db = new Database();

  // Ultra-simple query
  const stmt = await db.prepare("VALUES (?)");
  // Bind null to the parameter and get the result
  expect(await stmt.get([null])).toEqual(
    [null],
    "binding a null value to a statement parameter"
  );
  await db.close();
});
