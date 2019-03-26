import _bootstrapGeneratedPackage from "./bootstrapGeneratedPackage";
import { exec } from "child_process";
import * as fs from "fs";
import { ensureDir, emptyDir, copy, move } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import jsTemplate from "../templates/js/templated/exported-class.template";
import rsTemplate from "../templates/rs/templated/client.template";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { types } from "@open-rpc/meta-schema";

import { getMethodTypingsMap, getFunctionSignature, getFunctionSignatureRS } from "./getTypings";

const cwd = process.cwd();

const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(exec);
const writeFile = promisify(fs.writeFile);

const cleanBuildDir = async (destinationDirectoryName: string): Promise<any> => {
  await ensureDir(destinationDirectoryName);
  await emptyDir(destinationDirectoryName);
};

const compileTemplate = async (name: string, schema: types.OpenRPC, language: string): Promise<string> => {
  const typeDefs = await getMethodTypingsMap(schema, language);
  const template = language === "rust" ? rsTemplate : jsTemplate;
  return template({
    className: name,
    generateMethodParamId,
    generateMethodResultId,
    getFunctionSignature: language === "rust" ? getFunctionSignatureRS : getFunctionSignature,
    methods: schema.methods,
    typeDefs,
  });
};

const copyStatic = async (destinationDirectoryName: string, language: string) => {
  await cleanBuildDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, "../", `/templates/${language}/static`);
  await copy(staticPath, destinationDirectoryName);
  try {
    await move(
      path.join(destinationDirectoryName, "_package.json"),
      path.join(destinationDirectoryName, "package.json"),
    );
  } catch (e) {
    // do nothing
  }
};

const typescript = async ({ clientName, schema }: any) => {
  const compiledResult = await compileTemplate(clientName, schema, "typescript");

  const destinationDirectoryName = `${cwd}/${clientName}/ts`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName, "js");
  await writeFile(`${destinationDirectoryName}/index.ts`, compiledResult, "utf8");

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

export default async ({ clientName, schema }: any) => {
  await rust({ clientName, schema });
  await typescript({ clientName, schema });
};
