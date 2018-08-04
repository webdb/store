import { Database } from "../../src/api/index";

// https://github.com/kripken/sql.js/issues/73

it("issue73", async () => {
  const db = new Database();

  const sqlstr = `
CREATE TABLE COMPANY(
  ID INT PRIMARY KEY     NOT NULL,
  NAME           TEXT    NOT NULL,
  AGE            INT     NOT NULL,
  ADDRESS        CHAR(50),
  SALARY         REAL
);
CREATE TABLE AUDIT(
  EMP_ID INT NOT NULL,
  ENTRY_DATE TEXT NOT NULL
);
CREATE TRIGGER audit_log AFTER INSERT
ON COMPANY
BEGIN
  INSERT INTO AUDIT(EMP_ID, ENTRY_DATE) VALUES (new.ID, '2014-11-10');
END;
INSERT INTO COMPANY VALUES (73,'A',8,'',1200);
SELECT * FROM AUDIT;
INSERT INTO COMPANY VALUES (42,'B',8,'',1600);
SELECT EMP_ID FROM AUDIT ORDER BY EMP_ID;
    `;
  const res = await db.exec(sqlstr);
  const expectedResult = [
    {
      columns: ["EMP_ID", "ENTRY_DATE"],
      values: [[73, "2014-11-10"]]
    },
    {
      columns: ["EMP_ID"],
      values: [[42], [73]]
    }
  ];
  expect(res).toEqual(
    expectedResult,
    "await db.exec with a statement that contains a ';'"
  );
});
