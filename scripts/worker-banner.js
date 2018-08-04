function createWorker(func) {
  const source = func.toString();
  const start = source.indexOf("{") + 1;
  const end = source.lastIndexOf("}");
  const code = source.slice(start, end);

  const objURL = URL.createObjectURL(
    new window.Blob([code], { type: "application/javascript" })
  );

  const worker = new Worker(objURL);
  URL.revokeObjectURL(objURL);
  return worker;
}
