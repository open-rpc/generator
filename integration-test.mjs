import SimpleMathClient from "./generated/client/typescript/build/index.js";
console.log("Running client test");
console.log("imported client: ", SimpleMathClient);

const client = new SimpleMathClient({
  transport: { type: "http", port: 4441, host: "localhost" }
});

client.addition(2, 2).then((result) => {
  if (result !== 4) { process.exit(1); }
  console.log("finished with result: ", result);
});
