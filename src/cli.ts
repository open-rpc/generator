#!/usr/bin/env node

import program = require("commander");
import orpcGenerator from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";

const version = require("../../package.json").version; // tslint:disable-line

async function run(component: any, otherstuff: any) {
  return Promise.resolve()
}

async function main() {
  program
    .option(
      "-d, --document [openrpcDocument]",
      "JSON string or a Path/Url pointing to an open rpc schema",
      "./openrpc.json",
    )
    .option(
      "-o, --outputDir [outputDirectory]",
      "output directory that the clients will be generated into",
      "./",
    )
    .command("generate <component> <language>")
    .option(
      "--name [packageName]",
      "The name to use for the generate package",
      "template-client",
    )
    .description("Generate a component for a specific language")
    .action(generatorCmd);

  program
    .command("build <component> [language]")
    .description("Produce a build for a particular component")
    .action(buildCmd);

  program
    .command("test <component> [language]")
    .description("Test a particular component build")
    .action(buildCmd);

  program
    .command("release <component> [language]")
    .description("Run release script for the particular component")
    .action(releaseCmd);

  await program.parseAsync(process.argv);
}
main().then(() => console.log("done"));

// program
//   .version(version, "-v, --version")
//   .option(
//     "-d, --document [openrpcDocument]",
//     "JSON string or a Path/Url pointing to an open rpc schema",
//     "./openrpc.json",
//   )
//   .option(
//     "-o, --outputDir [outputDirectory]",
//     "output directory that the clients will be generated into",
//     "./",
//   )
//   .option(
//     "--ts-name [packageName]",
//     "Name that will go in the package.json for the typescript client",
//     "template-client",
//   )
//   .option(
//     "--rs-name [crateName]",
//     "Name that will go in the crate name for the rust client",
//     "template-client",
//   )
//   .action(async () => {
//     let openrpcDocument: OpenRPC;
//     const outDir = program.outputDir || process.cwd();
//     try {
//       openrpcDocument = await parseOpenRPCDocument(program.document);
//     } catch (e) {
//       console.error(e.message); // tslint:disable-line
//       console.error("Please revise the validation errors above and try again."); // tslint:disable-line
//       return;
//     }

//     await orpcGenerator({
//       openrpcDocument,
//       outDir,
//       rsName: program.rsName || "template-client",
//       tsName: program.tsName || "template-client",
//     });

//     console.log("Done!"); // tslint:disable-line
//   })
//   .parse(process.argv);
