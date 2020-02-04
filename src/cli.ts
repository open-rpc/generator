#!/usr/bin/env node

import program = require("commander");
import orpcGenerator, {IGeneratorOptions} from "./";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";

import * as fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);

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
    "output directory that the clients will be generated into",
    "./",
  )
  .option(
    "-c, --config [generatorConfigPath]",
    "Path to a JSON file with declarative generator config"
  )
  .command("generate <component>", "generate a particular component")
  .option(
    "-l, --language <language>",
    "Path to a JSON file with declarative generator config"
  )
  .option(
    "-n, --name <name>",
    "Path to a JSON file with declarative generator config"
  )
  .action(async (component: "client" | "server", cmdObj: any) => {
    const outDir = program.outputDir || process.cwd();

    let config = {
      openrpcDocument: program.document,
      outDir,
      components: []
    } as IGeneratorOptions;

    if (program.config) {
      config = JSON.parse(await readFile(program.config, "utf8"));
    } else {
      config.components.push({
        type: component,
        name: cmdObj.name,
        language: cmdObj.language,
      });
    }

    await orpcGenerator(config);

    console.log("Done!"); // tslint:disable-line
  })
  .parse(process.argv);
