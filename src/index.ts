import * as fs from 'fs';
import { ensureDir, copy, move, remove } from 'fs-extra';
import * as path from 'path';
import { promisify } from 'util';
import { startCase } from 'lodash';
import { OpenrpcDocument as OpenRPC } from '@open-rpc/meta-schema';
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js';
import { TComponentConfig } from './config';
import Typings from '@open-rpc/typings';

import {
  defaultClientComponent,
  defaultDocComponent,
  defaultServerComponent,
  IComponentModule,
  FHook,
  IComponent,
} from './components';
export * as components from './components';

const writeFile = promisify(fs.writeFile);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const moveFiles = async (dirName: string, file1: string, file2: string): Promise<any> => {
  try {
    return await move(path.join(dirName, file1), path.join(dirName, file2));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return;
  }
};

interface IComponentModules {
  [k: string]: IComponentModule;
}

const componentModules: IComponentModules = {
  client: defaultClientComponent,
  server: defaultServerComponent,
  docs: defaultDocComponent,
};

const getComponentFromConfig = async (componentConfig: TComponentConfig): Promise<IComponent> => {
  const { language, name, type } = componentConfig;
  let openRPCPath: string | undefined = 'src';
  let extraConfig = undefined;
  if (componentConfig.type === 'docs') {
    extraConfig = componentConfig.extraConfig;
  }
  if (componentConfig.type === 'custom') {
    const componentPath = componentConfig.customComponent.startsWith('./')
      ? path.resolve(process.cwd(), componentConfig.customComponent)
      : componentConfig.customComponent;
    const compModule: IComponentModule = (await import(componentPath)).default;
    if (compModule.hooks === undefined) throw new Error('Hooks interface not exported or defined');
    openRPCPath =
      componentConfig.openRPCPath === null ? undefined : componentConfig.openRPCPath || 'src';
    return {
      hooks: compModule.hooks,
      staticPath: compModule.staticPath(language, componentConfig.customType),
      language,
      name,
      type,
      openRPCPath,
    };
  }
  const componentModule = componentModules[type];
  return {
    hooks: componentModule.hooks,
    staticPath: componentModule.staticPath(language, type),
    language,
    name,
    type,
    openRPCPath,
    extraConfig,
  };
};

const makeApplyHooks = (
  hooks: FHook[] | undefined,
  openrpcDocument: OpenRPC,
  typings: Typings,
  dereffedDocument: OpenRPC
) => {
  return async (destDir: string, srcDir: string | undefined, component: IComponent) => {
    if (hooks === undefined) return;
    if (hooks.length === 0) return;
    for (const hookFn of hooks) {
      await hookFn(destDir, srcDir, component, openrpcDocument, typings, dereffedDocument);
    }
  };
};

const copyStaticForComponent = async (
  destinationDirectoryName: string,
  component: IComponent,
  openrpcDocument: OpenRPC,
  typings: Typings,
  dereffedDocument: OpenRPC
) => {
  const { staticPath, hooks } = component;
  if (staticPath === undefined) return;

  const { beforeCopyStatic, afterCopyStatic } = hooks;
  const applyBeforeCopyStatic = makeApplyHooks(
    beforeCopyStatic,
    openrpcDocument,
    typings,
    dereffedDocument
  );
  const applyAfterCopyStatic = makeApplyHooks(
    afterCopyStatic,
    openrpcDocument,
    typings,
    dereffedDocument
  );

  await applyBeforeCopyStatic(destinationDirectoryName, staticPath, component);
  await copy(staticPath, destinationDirectoryName, { overwrite: true, dereference: true });

  // ignores errors incase there is no gitignore...
  // gets around an issue with the copy function whereby hidden dotfiles are not copied.
  await moveFiles(destinationDirectoryName, 'gitignore', '.gitignore');
  await remove(`${destinationDirectoryName}/gitignore`);

  // this is where we would do things like move _package.json to package.json, etc, etc
  await applyAfterCopyStatic(destinationDirectoryName, staticPath, component);
};

export interface IGeneratorOptions {
  outDir?: string;
  openrpcDocument: OpenRPC | string;
  components: TComponentConfig[];
}

const prepareOutputDirectory = async (outDir: string, component: IComponent): Promise<string> => {
  const destinationDirectoryName = `${outDir}/${component.type}/${component.language}`;
  const openRPCDefaultLocation = 'src';
  await ensureDir(`${destinationDirectoryName}/${openRPCDefaultLocation}`);
  return destinationDirectoryName;
};

const writeOpenRpcDocument = async (
  outDir: string,
  doc: OpenRPC | string,
  component: IComponent
): Promise<string | undefined> => {
  if (component.openRPCPath === undefined) return;
  const toWrite =
    typeof doc === 'string' ? await parseOpenRPCDocument(doc, { dereference: false }) : doc;
  const openRPCPath = `${outDir}/${component.openRPCPath}`;
  await ensureDir(openRPCPath);
  const destinationDirectoryName = `${openRPCPath}/openrpc.json`;
  await writeFile(destinationDirectoryName, JSON.stringify(toWrite, undefined, '  '), 'utf8');
  return destinationDirectoryName;
};

const compileTemplate = async (
  destDir: string,
  component: IComponent,
  openrpcDocument: OpenRPC,
  typings: Typings,
  dereffedDocument: OpenRPC
): Promise<boolean> => {
  const { hooks } = component;
  const { beforeCompileTemplate, afterCompileTemplate } = hooks;

  const applyBeforeCompileTemplate = makeApplyHooks(
    beforeCompileTemplate,
    openrpcDocument,
    typings,
    dereffedDocument
  );
  const applyAfterCompileTemplate = makeApplyHooks(
    afterCompileTemplate,
    openrpcDocument,
    typings,
    dereffedDocument
  );

  await applyBeforeCompileTemplate(destDir, undefined, component);

  // 1. read files in the templated directory,
  // 2. for each one, pass in the template params
  const templates = hooks.templateFiles[component.language];
  for (const t of templates) {
    const result = t.template({
      className: startCase(openrpcDocument.info.title).replace(/\s/g, ''),
      methodTypings: typings,
      openrpcDocument: openrpcDocument,
    });

    await writeFile(`${destDir}/${t.path}`, result, 'utf8');
  }

  await applyAfterCompileTemplate(destDir, undefined, component);

  return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clone = (x: any) => JSON.parse(JSON.stringify(x));

export default async (generatorOptions: IGeneratorOptions) => {
  const { openrpcDocument, outDir } = generatorOptions;
  let dereffedDocument: OpenRPC;
  const doc = await parseOpenRPCDocument(openrpcDocument, { dereference: false });

  try {
    dereffedDocument = await parseOpenRPCDocument(clone(doc));
  } catch (e) {
    console.error('Invalid OpenRPC document. Please revise the validation errors below:'); // tslint:disable-line
    console.error(e);
    throw e;
  }

  const methodTypings = new Typings(dereffedDocument);

  for (const componentConfig of generatorOptions.components) {
    const outPath = componentConfig.outPath;
    if (outPath === undefined && outDir === undefined) {
      console.error('No output path specified');
      throw new Error('No output path specified');
    }
    const component = await getComponentFromConfig(componentConfig);
    let destDir = outPath;
    if (!outPath) {
      destDir = await prepareOutputDirectory(outDir!, component);
    } else {
      await ensureDir(outPath);
    }
    await copyStaticForComponent(destDir!, component, doc, methodTypings, dereffedDocument);
    await writeOpenRpcDocument(destDir!, doc, component);
    await compileTemplate(destDir!, component, doc, methodTypings, dereffedDocument);
  }
};
