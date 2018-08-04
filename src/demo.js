import { Database } from "./api/index";

(async () => {
  const db = new Database();
  console.log("db1", db);
  await db.run(
    `CREATE TABLE hello (a int, b char);
INSERT INTO hello VALUES (0, 'hello');
INSERT INTO hello VALUES (1, 'world');`
  );

  console.log("db2", db);

  const res1 = await db.exec("SELECT * FROM hello");
  console.log("res1", JSON.stringify(res1, null, 2));

  const stmt = await db.prepare(
    "SELECT * FROM hello WHERE a=:aval AND b=:bval"
  );

  const result = await stmt.getAsObject({
    ":aval": 1,
    ":bval": "world"
  });
  console.log("object", result);
  await stmt.bind([0, "hello"]);

  while (await stmt.step()) {
    console.log("step", await stmt.get());
  }
  await stmt.free();

  const dbData = await db.export();
  console.log("dbData", dbData);
})().then(
  () => console.log("done"),
  err => console.error("errrr", err, err.stack)
);
