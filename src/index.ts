import _bootstrapGeneratedPackage from "./bootstrapGeneratedPackage";
import { exec } from "child_process";
import * as fs from "fs";
import { ensureDir, emptyDir, copy, move } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import jsTemplate from "../templates/js/templated/exported-class.template";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { types } from "@open-rpc/meta-schema";

import { getMethodTypingsMap, getFunctionSignature } from "./getTypings";

const cwd = process.cwd();

const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(exec);
const writeFile = promisify(fs.writeFile);

const cleanBuildDir = async (destinationDirectoryName: string): Promise<any> => {
  await ensureDir(destinationDirectoryName);
  await emptyDir(destinationDirectoryName);
};

const compileTemplate = async (name: string, schema: types.OpenRPC): Promise<string> => {
  const typeDefs = await getMethodTypingsMap(schema);
  return jsTemplate({
    className: name,
    generateMethodParamId,
    generateMethodResultId,
    methods: schema.methods,
    typeDefs,
    getFunctionSignature
  });
};

const copyStatic = async (destinationDirectoryName: string) => {
  await cleanBuildDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, "../", "/templates/js/static");
  await copy(staticPath, destinationDirectoryName);
  await move(
    path.join(destinationDirectoryName, "_package.json"),
    path.join(destinationDirectoryName, "package.json"),
  );
};

export default async ({ clientName, schema }: any) => {
  const compiledResult = await compileTemplate(clientName, schema);

  const destinationDirectoryName = `${cwd}/${clientName}`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName);
  await writeFile(`${destinationDirectoryName}/index.ts`, compiledResult, "utf8");

  await bootstrapGeneratedPackage(destinationDirectoryName);
  return true;
};
