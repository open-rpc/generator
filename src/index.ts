import { exec } from "child_process";
import * as fs from "fs";
import { ensureDir, emptyDir, copy, move, readFile } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import { startCase } from "lodash";
import { OpenRPC } from "@open-rpc/meta-schema";
import TOML from "@iarna/toml";

import MethodTypings from "@open-rpc/typings";

import _bootstrapGeneratedPackage from "./bootstrapGeneratedPackage";

import jsTemplate from "../templates/typescript/templated/exported-class.template";
import rsTemplate from "../templates/rust/templated/client.template";

const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(exec);
const writeFile = promisify(fs.writeFile);

const cleanBuildDir = async (destinationDirectoryName: string): Promise<any> => {
  await ensureDir(destinationDirectoryName);
  await emptyDir(destinationDirectoryName);
};

const compileTemplate = async (
  openrpcDocument: OpenRPC,
  language: string,
  methodTypings: MethodTypings,
): Promise<string> => {
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
  await cleanBuildDir(destinationDirectoryName);

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

  const methodTypings = new MethodTypings(openrpcDocument);
  await methodTypings.generateTypings();

  return Promise.all(["typescript", "rust"].map(async (language) => {
    const compiledResult = await compileTemplate(openrpcDocument, language, methodTypings);

    const destinationDirectoryName = `${outDir}/${language}`;
    await cleanBuildDir(destinationDirectoryName);
    await copyStatic(destinationDirectoryName, language);
    await postProcessStatic(destinationDirectoryName, generatorOptions, language);
    await writeFile(`${destinationDirectoryName}/src/${languageFilenameMap[language]}`, compiledResult, "utf8");

    await bootstrapGeneratedPackage(destinationDirectoryName, language);
  }));
};
