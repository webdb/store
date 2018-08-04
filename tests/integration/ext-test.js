import { Database } from "../../src/api/index";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;

it("ext", async () => {
  const db = new Database();

  await db.exec("CREATE TABLE test (str_data, data);");

  await db.run("INSERT INTO test VALUES ('Hello World!', 1);");
  await db.run("INSERT INTO test VALUES ('', 2);");
  await db.run("INSERT INTO test VALUES ('', 2);");
  await db.run("INSERT INTO test VALUES ('', 4);");
  await db.run("INSERT INTO test VALUES ('', 5);");
  await db.run("INSERT INTO test VALUES ('', 6);");
  await db.run("INSERT INTO test VALUES ('', 7);");
  await db.run("INSERT INTO test VALUES ('', 8);");
  await db.run("INSERT INTO test VALUES ('', 9);");

  let res = await db.exec("SELECT mode(data) FROM test;");
  let expectedResult = [
    {
      columns: ["mode(data)"],
      values: [[2]]
    }
  ];
  expect(res).toEqual(expectedResult, "mode() function works");

  res = await db.exec("SELECT lower_quartile(data) FROM test;");
  expectedResult = [
    {
      columns: ["lower_quartile(data)"],
      values: [[2]]
    }
  ];
  expect(res).toEqual(expectedResult, "upper_quartile() function works");

  res = await db.exec("SELECT upper_quartile(data) FROM test;");
  expectedResult = [
    {
      columns: ["upper_quartile(data)"],
      values: [[7]]
    }
  ];
  expect(res).toEqual(expectedResult, "upper_quartile() function works");

  res = await db.exec("SELECT variance(data) FROM test;");
  expect(Number(res[0].values[0][0].toFixed(2))).toEqual(
    8.11,
    "variance() function works"
  );

  res = await db.exec("SELECT stdev(data) FROM test;");
  expect(Number(res[0].values[0][0].toFixed(2))).toEqual(
    2.85,
    "stdev() function works"
  );

  res = await db.exec("SELECT acos(data) FROM test;");
  expect(Number(res[0].values[0][0].toFixed(2))).toEqual(
    0,
    "acos() function works"
  );

  res = await db.exec("SELECT asin(data) FROM test;");
  expect(Number(res[0].values[0][0].toFixed(2))).toEqual(
    1.57,
    "asin() function works"
  );

  res = await db.exec("SELECT atan2(data, 1) FROM test;");
  expect(Number(res[0].values[0][0].toFixed(2))).toEqual(
    0.79,
    "atan2() function works"
  );

  res = await db.exec("SELECT difference(str_data, 'ello World!') FROM test;");
  expect(Number(res[0].values[0][0])).toEqual(3, "difference() function works");

  res = await db.exec("SELECT ceil(4.1)");
  expect(Number(res[0].values[0][0])).toEqual(5, "ceil() function works");

  res = await db.exec("SELECT floor(4.1)");
  expect(Number(res[0].values[0][0])).toEqual(4, "floor() function works");

  res = await db.exec("SELECT pi()");
  expect(Number(res[0].values[0][0].toFixed(5))).toEqual(
    3.14159,
    "pi() function works"
  );

  res = await db.exec("SELECT reverse(str_data) FROM test;");
  expect(res[0].values[0][0]).toEqual(
    "!dlroW olleH",
    "reverse() function works"
  );
});
