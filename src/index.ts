import _bootstrapGeneratedPackage from "./bootstrapGeneratedPackage";
import { exec } from "child_process";
import * as fs from "fs";
import { ensureDir, emptyDir, copy, move } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import jsTemplate from "../templates/js/templated/exported-class.template";
import rsTemplate from "../templates/rs/templated/client.template";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";

import { MethodTypings } from "@open-rpc/schema-utils-js";
import { IMethodTypingsMap } from "./generators/generator-interface";
import { map } from "lodash";
import { MethodObject, ContentDescriptorObject, OpenRPC } from "@open-rpc/meta-schema";

const cwd = process.cwd();

const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(exec);
const writeFile = promisify(fs.writeFile);

const cleanBuildDir = async (destinationDirectoryName: string): Promise<any> => {
  await ensureDir(destinationDirectoryName);
  await emptyDir(destinationDirectoryName);
};

const compileTemplate = async (name: string, schema: OpenRPC, language: string): Promise<string> => {
  const methodTypings = new MethodTypings(schema);
  await methodTypings.generateTypings();

  const template = language === "rust" ? rsTemplate : jsTemplate;
  return template({
    className: name,
    methodTypings,
    methods: schema.methods,
    openrpcDocument: schema,
  });
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

  moveFiles(destinationDirectoryName, "_package.json", "package.json");
  moveFiles(destinationDirectoryName, "gitignore", ".gitignore");
};

const typescript = async ({ clientName, schema }: any) => {
  const compiledResult = await compileTemplate(clientName, schema, "typescript");

  const destinationDirectoryName = `${cwd}/${clientName}/ts`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName, "js");
  await writeFile(`${destinationDirectoryName}/src/index.ts`, compiledResult, "utf8");

  await bootstrapGeneratedPackage(destinationDirectoryName, "typescript");
  return true;
};

const rust = async ({ clientName, schema }: any) => {
  const compiledResult = await compileTemplate(clientName, schema, "rust");

  const destinationDirectoryName = `${cwd}/${clientName}/rs`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName, "rs");
  await writeFile(`${destinationDirectoryName}/src/lib.rs`, compiledResult, "utf8");

  await bootstrapGeneratedPackage(destinationDirectoryName, "rust");
  return true;
};

export default ({ clientName, schema }: any) => {
  return Promise.all([
    rust({ clientName, schema }),
    typescript({ clientName, schema }),
  ]);
};
