import { Database } from "../../src/api/index";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;

it("blob", async () => {
  const db = new Database();
  await db.exec(
    "CREATE TABLE test (data); INSERT INTO test VALUES (x'6162ff'),(x'00')"
  ); // Insert binary data. This is invalid UTF8 on purpose

  let stmt = await db.prepare("INSERT INTO test VALUES (?)");

  const bigArray = new Uint8Array(1e6);
  bigArray[500] = 0x42;
  await stmt.run([bigArray]);

  stmt = await db.prepare("SELECT * FROM test ORDER BY length(data) DESC");

  await stmt.step();
  const [array] = await stmt.get();

  for (let i = 0; i < bigArray.length; i++) {
    expect(array[i]).toEqual(
      bigArray[i],
      "The blob stored in the database should be exactly the same as the one that was inserted"
    );
  }

  await stmt.step();
  let res = await stmt.get();
  expect(res).toEqual([new Uint8Array([0x61, 0x62, 0xff])], "Reading BLOB");

  await stmt.step();
  res = await stmt.get();
  expect(res).toEqual(
    [new Uint8Array([0x00])],
    "Reading BLOB with a null byte"
  );

  expect(await stmt.step()).toEqual(
    false,
    "await stmt.step() should return false after all values were read"
  );
  await db.close();
});
