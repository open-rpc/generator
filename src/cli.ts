#!/usr/bin/env node

import program = require("commander");
import orpcGenerator, {IGeneratorOptions} from "./";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import inquirer from "inquirer";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import {capitalize} from "lodash";
import * as fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const version = require("../package.json").version; // tslint:disable-line

program
  .version(version, "-v, --version")
  .command("init")
  .action(async () => {
    const initAnswers = await inquirer.prompt([
      {
        name: "document",
        type: "input",
        message: "Where is your OpenRPC document? May be a file path or url.",
        default: () => "openrpc.json",
        validate: async (d: any) => {
          try {
            await parseOpenRPCDocument(d);
          } catch (e) {
            return `Invalid document. The error recieved: ${e.message}`
          }
          return true;
        }
      },
      {
        name: "outDir",
        type: "input",
        message: "Where would you like the generated artifacts to be written to?",
        default: () => "./"
      },
      {
        name: "snapName",
        type: "input",
        message: "What would you like the snap to be named?",
      },
      {
        name: "componentTypes",
        type: "checkbox",
        message: "What additional components would you like to generate?",
        choices: [
          { name: "client" },
          { name: "docs" },
        ]
      },
      {
        name: "clientName",
        type: "input",
        message: "What would you like the client package to be named?",
        when: (answers: any) => answers.componentTypes && answers.componentTypes.find((ct: string) => ct === "client") !== undefined
      },
      {
        name: "docsName",
        type: "input",
        message: "What would you like the docs package to be named?",
        when: (answers: any) => answers.componentTypes && answers.componentTypes.find((ct: string) => ct === "docs") !== undefined
      },
    ]);

    const components: any  = [];

    console.log("Here is a summary of your Generator configuration:");//tslint:disable-line
    console.log(JSON.stringify(initAnswers, undefined, "\t"));//tslint:disable-line

    initAnswers.componentTypes.forEach((componentType: string) => {
      components.push({
        type: componentType,
        name: initAnswers[`${capitalize(componentType)}Name`]
      });
    });
    components.push({
      type: "snap",
      name: initAnswers.snapName
    });

    const config = {
      openrpcDocument: initAnswers.document,
      outDir: initAnswers.outDir,
      components
    };

    console.log("Writing your config..."); //tslint:disable-line
    await writeFile(
      "./open-rpc-generator-config.json",
      JSON.stringify(config, undefined, "    "),
      "utf8",
    );
    console.log("Config created at open-rpc-generator-config.json. To generate components for the first time run:"); // tslint:disable-line
    console.log("snaps-openrpc-generator generate -c ./open-rpc-generator-config.json "); // tslint:disable-line
  });


program
  .command("generate")
  .option(
    "-o, --outputDir [outputDirectory]",
    "output directory that the components will be generated to",
    "./",
  )
  .option("-c, --config [generatorConfigPath]", "Path to a JSON file with declarative generator config")
  .action(async (opts: any) => {
    const outDir = opts.outputDir || process.cwd();

    let config = {
      openrpcDocument: opts.document,
      outDir,
      components: []
    } as IGeneratorOptions;

    if (opts.config) {
      config = {
        ...config,
        ...JSON.parse(await readFile(opts.config, "utf8"))
      };
    } else {
      config.components.push({
        type: opts.type,
        name: opts.useName,
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
