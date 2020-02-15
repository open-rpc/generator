import * as fs from "fs";
import { ensureDir, copy, move, remove } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import { startCase, TemplateExecutor } from "lodash";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

import MethodTypings from "@open-rpc/typings";

import clientComponent from "./components/client";
import serverComponent from "./components/server";
import docsComponent from "./components/docs";

const writeFile = promisify(fs.writeFile);

const moveFiles = async (dirName: string, file1: string, file2: string) => {
  try {
    await move(path.join(dirName, file1), path.join(dirName, file2));
  } catch (error) {
    // do nothing
  }
};

type FHook = (
  destDir: string,
  fromDir: string,
  component: TComponentConfig,
  openrpcDocument: OpenRPC,
  methodTypings: MethodTypings,
) => Promise<any>;

export interface IHooks {
  beforeCopyStatic?: FHook[];
  afterCopyStatic?: FHook[];
  beforeCompileTemplate?: FHook[];
  afterCompileTemplate?: FHook[];
  templateFiles: {
    [key: string]: {
      path: string;
      template: TemplateExecutor;
    }[];
  };
}

interface IComponentHooks {
  [k: string]: IHooks;
}

const componentHooks: IComponentHooks = {
  client: clientComponent,
  server: serverComponent,
  docs: docsComponent,
};

const getComponentTemplatePath = (component: TComponentConfig) => {
  const d = `/templates/${component.type}/${component.language}/`;
  return path.join(__dirname, "../", d);
};

const copyStaticForComponent = async (
  destinationDirectoryName: string,
  component: TComponentConfig,
  dereffedDocument: OpenRPC,
  methodTypings: MethodTypings,
) => {
  const staticPath = getComponentTemplatePath(component);

  const hooks = componentHooks[component.type];
  const { beforeCopyStatic, afterCopyStatic } = hooks;
  if (beforeCopyStatic && beforeCopyStatic.length && beforeCopyStatic.length > 0) {
    await Promise.all(
      beforeCopyStatic.map(
        (hookFn: any) => hookFn(
          destinationDirectoryName,
          staticPath,
          component,
          dereffedDocument,
          methodTypings,
        ),
      ),
    );
  }

  await copy(staticPath, destinationDirectoryName, { overwrite: true });

  // ignores errors incase there is no gitignore...
  // gets around an issue with the copy function whereby hidden dotfiles are not copied.
  await moveFiles(destinationDirectoryName, "gitignore", ".gitignore");
  await remove(`${destinationDirectoryName}/gitignore`);

  // this is where we would do things like move _package.json to package.json, etc, etc
  if (afterCopyStatic && afterCopyStatic.length && afterCopyStatic.length > 0) {
    await Promise.all(
      afterCopyStatic.map((hookFn: any) => hookFn(
        destinationDirectoryName,
        staticPath,
        component,
        dereffedDocument,
        methodTypings,
      )),
    );
  }
};

interface IClientConfig {
  type: "client";
  name: string;
  language: "typescript" | "rust";
}

interface IServerConfig {
  type: "server";
  name: string;
  language: "typescript";
}

interface IDocsConfig {
  type: "docs";
  name: string;
  language: "react";
}

type TComponentConfig = IClientConfig | IServerConfig | IDocsConfig;

export interface IGeneratorOptions {
  outDir: string;
  openrpcDocument: OpenRPC | string;
  components: TComponentConfig[];
}

const prepareOutputDirectory = async (outDir: string, component: TComponentConfig) => {
  const destinationDirectoryName = `${outDir}/${component.type}/${component.language}`;
  await ensureDir(destinationDirectoryName);
  return destinationDirectoryName;
};

const writeOpenRpcDocument = async (
  outDir: string,
  doc: OpenRPC | string,
  component: TComponentConfig,
) => {
  const toWrite = typeof doc === "string" ? await parseOpenRPCDocument(doc, { dereference: false }) : doc;
  const destinationDirectoryName = `${outDir}/${component.type}/${component.language}/src/openrpc.json`;
  await writeFile(destinationDirectoryName, JSON.stringify(toWrite, undefined, "  "), "utf8");
  return destinationDirectoryName;
};

const compileTemplate = async (
  destDir: string,
  component: TComponentConfig,
  dereffedDocument: OpenRPC,
  methodTypings: MethodTypings,
) => {
  const templatedPath = `${getComponentTemplatePath(component)}/templated`;

  const hooks = componentHooks[component.type];
  const { beforeCompileTemplate, afterCompileTemplate } = hooks;

  if (beforeCompileTemplate && beforeCompileTemplate.length && beforeCompileTemplate.length > 0) {
    await Promise.all(
      beforeCompileTemplate.map(
        (hookFn: any) => hookFn(destDir, templatedPath, component, dereffedDocument, methodTypings),
      ),
    );
  }

  // 1. read files in the templated directory,
  // 2. for each one, pass in the template params
  const templates = hooks.templateFiles[component.language];
  await Promise.all(
    templates.map(async (t) => {
      const result = t.template({
        className: startCase(dereffedDocument.info.title).replace(/\s/g, ""),
        methodTypings,
        openrpcDocument: dereffedDocument,
      });

      await writeFile(`${destDir}/${t.path}`, result, "utf8");
    }),
  );

  if (afterCompileTemplate && afterCompileTemplate.length && afterCompileTemplate.length > 0) {
    await Promise.all(
      afterCompileTemplate.map(
        (hookFn: any) => hookFn(destDir, templatedPath, component, dereffedDocument, methodTypings),
      ),
    );
  }
};

export default async (generatorOptions: IGeneratorOptions) => {
  const { openrpcDocument, outDir } = generatorOptions;
  let dereffedDocument: OpenRPC;

  try {
    dereffedDocument = await parseOpenRPCDocument(openrpcDocument);
  } catch (e) {
    console.error("Invalid OpenRPC document. Please revise the validation errors below:"); // tslint:disable-line
    console.error(e);
    throw e;
  }

  const methodTypings = new MethodTypings(dereffedDocument);

  const componentGeneratorPromises = generatorOptions.components.map(async (component) => {
    const destDir = await prepareOutputDirectory(outDir, component);
    await copyStaticForComponent(destDir, component, dereffedDocument, methodTypings);
    await writeOpenRpcDocument(outDir, openrpcDocument, component);
    await compileTemplate(destDir, component, dereffedDocument, methodTypings);
  });

  await Promise.all(componentGeneratorPromises);
};
