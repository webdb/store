// eslint-disable-next-line
function b64ToArray(base64) {
  if (typeof Buffer !== "undefined") {
    return Promise.resolve(Buffer.from(base64, "base64"));
  }

  return fetch(`data:application/octet-stream;base64,${base64}`).then(res =>
    res.arrayBuffer()
  );
}
