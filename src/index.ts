import * as fs from "fs";
import { ensureDir, copy, move, remove } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import { startCase, TemplateExecutor } from "lodash";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

import Typings from "@open-rpc/typings";

import clientComponent from "./components/client";
import serverComponent from "./components/server";
import docsComponent from "./components/docs";

const writeFile = promisify(fs.writeFile);

const moveFiles = async (dirName: string, file1: string, file2: string): Promise<any> => {
  try {
    return await move(path.join(dirName, file1), path.join(dirName, file2));
  } catch (error) {
    return;
  }
};

type FHook = (
  destDir: string,
  fromDir: string,
  component: TComponentConfig,
  openrpcDocument: OpenRPC,
  Typings: Typings,
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
  typings: Typings,
) => {
  const staticPath = getComponentTemplatePath(component);

  const hooks = componentHooks[component.type];
  const { beforeCopyStatic, afterCopyStatic } = hooks;

  if (beforeCopyStatic && beforeCopyStatic.length && beforeCopyStatic.length > 0) {
    for (const hookFn of beforeCopyStatic) {
      await hookFn(
        destinationDirectoryName,
        staticPath,
        component,
        dereffedDocument,
        typings,
      );
    }
  }

  await copy(staticPath, destinationDirectoryName, { overwrite: true });

  // ignores errors incase there is no gitignore...
  // gets around an issue with the copy function whereby hidden dotfiles are not copied.
  await moveFiles(destinationDirectoryName, "gitignore", ".gitignore");
  await remove(`${destinationDirectoryName}/gitignore`);

  // this is where we would do things like move _package.json to package.json, etc, etc
  if (afterCopyStatic && afterCopyStatic.length && afterCopyStatic.length > 0) {
    for (const hookFn of afterCopyStatic) {
      await hookFn(
        destinationDirectoryName,
        staticPath,
        component,
        dereffedDocument,
        typings,
      );
    }
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
  language: "gatsby";
}

type TComponentConfig = IClientConfig | IServerConfig | IDocsConfig;

export interface IGeneratorOptions {
  outDir: string;
  openrpcDocument: OpenRPC | string;
  components: TComponentConfig[];
}

const prepareOutputDirectory = async (outDir: string, component: TComponentConfig): Promise<string> => {
  const destinationDirectoryName = `${outDir}/${component.type}/${component.language}`;
  await ensureDir(destinationDirectoryName);
  return destinationDirectoryName;
};

const writeOpenRpcDocument = async (
  outDir: string,
  doc: OpenRPC | string,
  component: TComponentConfig,
): Promise<string> => {
  const toWrite = typeof doc === "string" ? await parseOpenRPCDocument(doc, { dereference: false }) : doc;
  const destinationDirectoryName = `${outDir}/${component.type}/${component.language}/src/openrpc.json`;
  await writeFile(destinationDirectoryName, JSON.stringify(toWrite, undefined, "  "), "utf8");
  return destinationDirectoryName;
};

const compileTemplate = async (
  destDir: string,
  component: TComponentConfig,
  dereffedDocument: OpenRPC,
  typings: Typings,
): Promise<boolean> => {
  const templatedPath = `${getComponentTemplatePath(component)}/templated`;

  const hooks = componentHooks[component.type];
  const { beforeCompileTemplate, afterCompileTemplate } = hooks;

  if (beforeCompileTemplate && beforeCompileTemplate.length && beforeCompileTemplate.length > 0) {
    for (const hookFn of beforeCompileTemplate) {
      await hookFn(destDir, templatedPath, component, dereffedDocument, typings);
    }
  }

  // 1. read files in the templated directory,
  // 2. for each one, pass in the template params
  const templates = hooks.templateFiles[component.language];
  for (const t of templates) {
    const result = t.template({
      className: startCase(dereffedDocument.info.title).replace(/\s/g, ""),
      methodTypings: typings,
      openrpcDocument: dereffedDocument,
    });

    await writeFile(`${destDir}/${t.path}`, result, "utf8");
  }

  if (afterCompileTemplate && afterCompileTemplate.length && afterCompileTemplate.length > 0) {
    for (const hookFn of afterCompileTemplate) {
      await hookFn(destDir, templatedPath, component, dereffedDocument, typings);
    }
  }

  return true;
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

  const methodTypings = new Typings(dereffedDocument);

  for (const component of generatorOptions.components) {
    const destDir = await prepareOutputDirectory(outDir, component);
    await copyStaticForComponent(destDir, component, dereffedDocument, methodTypings);
    await writeOpenRpcDocument(outDir, openrpcDocument, component);
    await compileTemplate(destDir, component, dereffedDocument, methodTypings);
  }
};
