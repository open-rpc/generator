import program = require("commander");
import orpcGenerator from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

program
  .usage("[options] <clientName>")
  .arguments("<clientName>")
  .option("-s, --schema [schema]", "JSON string or a Path/Url pointing to an open rpc schema")
  .action(async (clientName) => {
    const schema = await parseOpenRPCDocument(program.schema);

    orpcGenerator({ clientName, schema, languages: ["js"] })
      .then(() => {
        console.log("Finished! Client has been generated.");
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  })
  .parse(process.argv);
