#!/usr/bin/env node

import program = require("commander");
import orpcGenerator from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

program
  .version(`v${require('../../package.json').version}`, '-v, --version')
  .option("-d, --document [openrpcDocument]", "JSON string or a Path/Url pointing to an open rpc schema", "./openrpc.json")
  .action(async () => {
    const openrpcDocument = await parseOpenRPCDocument(program.document);

    await orpcGenerator({ outDir: process.cwd(), openrpcDocument });

    console.log("Done!");
  })
  .parse(process.argv);
