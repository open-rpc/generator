import * as fs from "fs";
import { ensureDir, copy, move } from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import { startCase, TemplateExecutor } from "lodash";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";

import MethodTypings from "@open-rpc/typings";

import clientComponent from "./components/client";
import serverComponent from "./components/server";

const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);

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
    [key: string]: Array<{
      path: string;
      template: TemplateExecutor;
    }>;
  };
}

interface IComponentHooks {
  [k: string]: IHooks;
}

const componentHooks: IComponentHooks = {
  client: clientComponent,
  server: serverComponent,
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
  const staticPath = `${getComponentTemplatePath(component)}/static`;

  const hooks = componentHooks[component.type];
  const { beforeCopyStatic, afterCopyStatic } = hooks;
  if (beforeCopyStatic && beforeCopyStatic.length && beforeCopyStatic.length > 0) {
    await Promise.all(
      beforeCopyStatic.map(
        (hookFn: any) => hookFn(
          destinationDirectoryName,
          staticPath,
          component,
          component,
          dereffedDocument,
          methodTypings,
        ),
      ),
    );
  }

  await copy(staticPath, destinationDirectoryName);

  // ignores errors incase there is no gitignore...
  // gets around an issue with the copy function whereby hidden dotfiles are not copied.
  await moveFiles(destinationDirectoryName, "gitignore", ".gitignore");

  // this is where we would do things like move _package.json to package.json, etc, etc
  if (afterCopyStatic && afterCopyStatic.length && afterCopyStatic.length > 0) {
    await Promise.all(
      afterCopyStatic.map((hookFn: any) => hookFn(
        destinationDirectoryName,
        staticPath,
        component,
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

type TComponentConfig = IClientConfig | IServerConfig;

export interface IGeneratorOptions {
  outDir: string;
  openrpcDocument: OpenRPC;
  components: TComponentConfig[];
}

const languageFilenameMap: any = {
  rust: "lib.rs",
  typescript: "index.ts",
};

const prepareOutputDirectory = async (outDir: string, component: TComponentConfig) => {
  const destinationDirectoryName = `${outDir}/${component.type}/${component.language}`;
  await ensureDir(destinationDirectoryName);
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
      beforeCompileTemplate.map((hookFn: any) => hookFn(destDir, templatedPath, component, dereffedDocument)),
    );
  }

  // 1. read files in the templated directory,
  // 2. for each one, pass in the template params
  const templates = await readDir(templatedPath);
  await Promise.all(
    templates.map(async (t) => {
      const template = await import(`${templatedPath}/${t}`);
      const result = template({
        className: startCase(dereffedDocument.info.title).replace(/\s/g, ""),
        methodTypings,
        dereffedDocument,
      });

      await writeFile(`${destDir}/src/${t.replace(".template", "")}`, result, "utf8");
    }),
  );

  if (afterCompileTemplate && afterCompileTemplate.length && afterCompileTemplate.length > 0) {
    await Promise.all(
      afterCompileTemplate.map((hookFn: any) => hookFn(destDir, templatedPath, component, dereffedDocument)),
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
    await compileTemplate(destDir, component, dereffedDocument, methodTypings);
  });

  await Promise.all(componentGeneratorPromises);
};
