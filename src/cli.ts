#!/usr/bin/env node

import program = require("commander");
import orpcGenerator from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

program
  .usage("[options] <clientName>")
  .arguments("<clientName>")
  .option("-s, --schema [schema]", "JSON string or a Path/Url pointing to an open rpc schema")
  .action(async () => {
    const openrpcDocument = await parseOpenRPCDocument(program.schema);

    await orpcGenerator({ outDir: process.cwd(), openrpcDocument });

    console.log("Done!");
  })
  .parse(process.argv);
