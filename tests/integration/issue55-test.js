import dbData from "./issue55.db";
import { Database } from "../../src/api/index";

// https://github.com/kripken/sql.js/issues/55

it("issue55", async () => {
  // Works
  const db = new Database(dbData);

  const stmt1 = await db.prepare(
    "SELECT COUNT(*) AS count FROM networklocation"
  );
  const values1 = await stmt1.getAsObject({});
  const origCount = values1.count;

  await db.run(
    "INSERT INTO networklocation (x, y, network_id, floor_id) VALUES (?, ?, ?, ?)",
    [123, 123, 1, 1]
  );

  const stmt2 = await db.prepare(
    "SELECT COUNT(*) AS count FROM networklocation"
  );
  const values2 = await stmt2.getAsObject({});
  const { count } = values2;

  expect(count).toEqual(origCount + 1, "The row has been inserted");
  const dbCopy = new Database(await db.export());

  const stmt3 = await dbCopy.prepare(
    "SELECT COUNT(*) AS count FROM networklocation"
  );
  const values3 = await stmt3.getAsObject({});
  const newCount = values3.count;

  expect(newCount).toEqual(count, "export and reimport copies all the data");
});
