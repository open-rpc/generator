#!/usr/bin/env node

import program = require("commander");
import orpcGenerator from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";

const version = require("../../package.json").version; // tslint:disable-line

program
  .version(version, "-v, --version")
  .option(
    "-d, --document [openrpcDocument]",
    "JSON string or a Path/Url pointing to an open rpc schema",
    "./openrpc.json",
  )
  .option(
    "-o, --outputDir [outputDirectory]",
    "JSON string or a Path/Url pointing to an open rpc schema",
    "./openrpc.json",
  )
  .option(
    "--ts-name [packageName]",
    "Name that will go in the package.json for the typescript client",
    "@foo/bar",
  )
  .option(
    "--rs-name [crateName]",
    "Name that will go in the crate name for the rust client",
    "foo-bar",
  )
  .action(async () => {
    let openrpcDocument: OpenRPC;
    const outDir = program.outputDir || process.cwd();
    try {
      openrpcDocument = await parseOpenRPCDocument(program.document);
    } catch (e) {
      console.error(e.message); // tslint:disable-line
      console.error("Please revise the validation errors above and try again."); // tslint:disable-line
      return;
    }

    await orpcGenerator({
      openrpcDocument,
      outDir,
      rsName: program.rsName || "template-client",
      tsName: program.tsName || "template-client",
    });

    console.log("Done!"); // tslint:disable-line
  })
  .parse(process.argv);
