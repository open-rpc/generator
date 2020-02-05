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
    const answers = await inquirer.prompt([
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
        name: "componentTypes",
        type: "checkbox",
        message: "Which components would you like to generate?",
        choices: [
          { name: "client" },
          { name: "server" },
        ]
      },
      {
        name: "clientLanguages",
        type: "checkbox",
        message: "What language(s) would you like to generate a client for?",
        choices: [
          { name: "typescript" },
          { name: "rust" },
        ],
        when: (answers: any) => answers.componentTypes && answers.componentTypes.find((ct: string) => ct === "client") !== undefined
      },
      {
        name: "serverLanguages",
        type: "checkbox",
        message: "What language(s) would you like to generate a server for?",
        choices: [
          { name: "typescript" }
        ],
        when: (answers: any) => answers.componentTypes && answers.componentTypes.find((ct: string) => ct === "server") !== undefined
      },
      {
        name: "typescriptClientName",
        type: "input",
        message: "What would you like the typescript client package to be named?",
        when: (answers: any) => answers.clientLanguages && answers.clientLanguages.find((ct: string) => ct === "typescript") !== undefined
      },
      {
        name: "rustClientName",
        type: "input",
        message: "What would you like the rust client crate to be named?",
        when: (answers: any) => answers.clientLanguages && answers.clientLanguages.find((ct: string) => ct === "rust") !== undefined
      },
      {
        name: "typescriptServerName",
        type: "input",
        message: "What would you like the typescript server package to be named?",
        when: (answers: any) => answers.serverLanguages && answers.serverLanguages.find((ct: string) => ct === "typescript") !== undefined
      },
    ]);

    const components: any  = [];

    console.log("Here is a summary of your Generator configuration:");
    console.log(JSON.stringify(answers, undefined, "\t"));

    answers.componentTypes.forEach((componentType: string) => {
      answers[`${componentType}Languages`].forEach((language: any) => {
        components.push({
          type: componentType,
          name: answers[`${language}${capitalize(componentType)}Name`],
          language
        });
      });
    });

    const config = {
      openrpcDocument: answers.document,
      outDir: answers.outDir,
      components
    };

    console.log("Writing your config...");
    await writeFile(
      "./open-rpc-generator-config.json",
      JSON.stringify(config, undefined, "    "),
      "utf8",
    );
    console.log("Config created at open-rpc-generator-config.json. To generate components for the first time run:");
    console.log("open-rpc-generator generate -c ./open-rpc-generator-config.json ");
  });

program
  .command("generate")
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
  .action(async (opts) => {
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
        language: opts.language,
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
