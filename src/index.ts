import { exec } from "child_process";
import * as fs from "fs";
import { ensureDir, emptyDir, copy, move, readFile } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import { startCase } from "lodash";
import { OpenrpcDocument as OpenRPC, JSONSchema } from "@open-rpc/meta-schema";
import TOML from "@iarna/toml";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

import MethodTypings from "@open-rpc/typings";

import jsTemplate from "../templates/typescript/templated/exported-class.template";
import rsTemplate from "../templates/rust/templated/client.template";

const writeFile = promisify(fs.writeFile);

const compileTemplate = (openrpcDocument: OpenRPC, language: string, methodTypings: MethodTypings): string => {
  const template = language === "rust" ? rsTemplate : jsTemplate;
  return template({
    className: startCase(openrpcDocument.info.title).replace(/\s/g, ""),
    methodTypings,
    openrpcDocument,
  });
};

const processRust = async (
  destinationDirectoryName: string,
  generatorOptions: IGeneratorOptions,
) => {
  const cargoTOMLPath = path.join(destinationDirectoryName, "Cargo.toml");
  const fileContents = await readFile(cargoTOMLPath);
  const cargoTOML = TOML.parse(fileContents.toString());
  const updatedCargo = TOML.stringify({
    ...cargoTOML,
    package: {
      ...cargoTOML.package as object,
      name: generatorOptions.rsName,
      version: generatorOptions.openrpcDocument.info.version,
    },
  });
  await writeFile(cargoTOMLPath, updatedCargo);
};

const processTypescript = async (
  destinationDirectoryName: string,
  generatorOptions: IGeneratorOptions,
) => {
  const packagePath = path.join(destinationDirectoryName, "package.json");
  const fileContents = await readFile(packagePath);
  const pkg = JSON.parse(fileContents.toString());
  const updatedPkg = JSON.stringify({
    ...pkg,
    name: generatorOptions.tsName,
    version: generatorOptions.openrpcDocument.info.version,
  });
  await writeFile(packagePath, updatedPkg);
};

const postProcessStatic = async (
  destinationDirectoryName: string,
  generatorOptions: IGeneratorOptions,
  language: string,
) => {
  if (language === "rust") {
    return processRust(destinationDirectoryName, generatorOptions);
  } else {
    return processTypescript(destinationDirectoryName, generatorOptions);
  }
};

const moveFiles = async (dirName: string, file1: string, file2: string) => {
  try {
    await move(path.join(dirName, file1), path.join(dirName, file2));
  } catch (error) {
    // do nothing
  }
};

const copyStatic = async (destinationDirectoryName: string, language: string) => {
  const staticPath = path.join(__dirname, "../", `/templates/${language}/static`);
  await copy(staticPath, destinationDirectoryName);

  await moveFiles(destinationDirectoryName, "_package.json", "package.json");
  await moveFiles(destinationDirectoryName, "gitignore", ".gitignore");
};

interface IGeneratorOptions {
  rsName: string;
  tsName: string;
  outDir: string;
  openrpcDocument: OpenRPC;
}

const languageFilenameMap: any = {
  rust: "lib.rs",
  typescript: "index.ts",
};

export default async (generatorOptions: IGeneratorOptions) => {
  const { openrpcDocument, outDir } = generatorOptions;
  let dereffedDocument;

  try {
    dereffedDocument = await parseOpenRPCDocument(openrpcDocument);
  } catch (e) {
    console.error("Invalid OpenRPC document. Please revise the validation errors below:"); // tslint:disable-line
    console.error(e);
    throw e;
  }

  const methodTypings = new MethodTypings(dereffedDocument);

  return Promise.all(["typescript", "rust"].map(async (language) => {
    const compiledResult = compileTemplate(openrpcDocument, language, methodTypings);

    const destinationDirectoryName = `${outDir}/${language}`;
    await copyStatic(destinationDirectoryName, language);
    await postProcessStatic(destinationDirectoryName, generatorOptions, language);
    await writeFile(`${destinationDirectoryName}/src/${languageFilenameMap[language]}`, compiledResult, "utf8");
  }));
};
