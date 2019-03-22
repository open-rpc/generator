import _bootstrapGeneratedPackage from "./bootstrapGeneratedPackage";
import { exec } from "child_process";
import { compile } from "json-schema-to-typescript";
import * as fs from "fs";
import * as fsx from "fs-extra";
import * as path from "path";
import * as _ from "lodash";
import { promisify } from "util";
import jsTemplate from "../templates/js/templated/exported-class.template";
import { generateMethodParamId } from "@open-rpc/schema-utils-js";

const cwd = process.cwd();

const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(exec);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const cleanBuildDir = async (destinationDirectoryName: string) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);
};

const getTypeName = (contentDescriptor: any) => {
  const { schema } = contentDescriptor;

  const interfaceTypes = ["array", "object"];
  let prefix = "T";
  if (schema.type && interfaceTypes.includes(schema.type)) {
    prefix = "I";
  }

  const contentDescriptorName = _.startCase(contentDescriptor.name).replace(/\s/g, "");

  return `${prefix}${contentDescriptorName}`;
};

const getTypings = async ({ methods }: { methods: [any] }) => {
  const contentDescriptorPromises = _.chain(methods)
    .map((method) => ({
      contentDescriptors: [...method.params, method.result],
      method,
    }))
    .flatMap(({ contentDescriptors, method }) => _.map(contentDescriptors, (contentDescriptor) => ({
      contentDescriptor,
      method,
    })))
    .filter(({ contentDescriptor }) => contentDescriptor.schema !== undefined)
    .map(async ({ method, contentDescriptor }) => ({
      typeId: generateMethodParamId(method, contentDescriptor),
      typeName: getTypeName(contentDescriptor),
      typings: await compile(contentDescriptor.schema, getTypeName(contentDescriptor), { bannerComment: "" }),
    }))
    .value();

  const typingsToAddToTemplate = await Promise.all(contentDescriptorPromises);

  return _.chain(typingsToAddToTemplate)
    .keyBy("typeId")
    .value();
};

const compileTemplate = async (name: string, schema: any) => {
  const typeDefs = await getTypings(schema);
  return jsTemplate({ className: name, methods: schema.methods, typeDefs, generateMethodParamId });
};

const copyStatic = async (destinationDirectoryName: string) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, "../", "/templates/js/static");
  await fsx.copy(staticPath, destinationDirectoryName);
  await fsx.move(
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
