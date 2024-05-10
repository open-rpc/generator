console.log("Running client test");
const SimpleMathClient = require("./generated/client/typescript/build").default;
console.log("imported client: ", SimpleMathClient);

const client = new SimpleMathClient({
  transport: { type: "http", port: 4441, host: "localhost" }
});

const go = async () => {
  await client.initialize();
  const result = await client.addition(2, 2);
  if (result !== 4) { process.exit(1); }
  console.log("finished with result: ", result);
}

go();
