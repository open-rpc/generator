#!/usr/bin/env node

import program = require("commander");
import orpcGenerator, {IGeneratorOptions} from "./";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";

import * as fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);

const version = require("../package.json").version; // tslint:disable-line

program
  .version(version, "-v, --version")
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
  .option(
    "-c, --config [generatorConfigPath]",
    "Path to a JSON file with declarative generator config"
  )
  .option(
    "-t, --type [type]",
    "component type"
  )
  .option(
    "-l, --language [language]",
    "component language"
  )
  .option(
    "-n, --useName [useName]",
    "Name to use for the generated component"
  )
  .action(async () => {
    const outDir = program.outputDir || process.cwd();

    let config = {
      openrpcDocument: program.document,
      outDir,
      components: []
    } as IGeneratorOptions;

    if (program.config) {
      config = {
        ...config,
        ...JSON.parse(await readFile(program.config, "utf8"))
      };
    } else {
      config.components.push({
        type: program.type,
        name: program.useName,
        language: program.language,
      });
    }

    try {
      await orpcGenerator(config);
    } catch(e) {
      console.error("There was error at generator runtime:");
      console.error(e);
      process.exit(1);

    }

    console.log("Done!"); // tslint:disable-line
  });


program.parseAsync(process.argv);
