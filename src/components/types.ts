import { TemplateExecutor } from 'lodash';
import { OpenrpcDocument as OpenRPC } from '@open-rpc/meta-schema';
import Typings from '@open-rpc/typings';

export interface IComponent<ConfigType = unknown> {
  hooks: IHooks;
  type: string;
  name: string;
  language: string;
  staticPath?: string;
  openRPCPath?: string;
  extraConfig?: ConfigType;
}

export type FHook = (
  destDir: string,
  fromDir: string | undefined,
  component: IComponent,
  openrpcDocument: OpenRPC,
  Typings: Typings,
  dereffedDocument: OpenRPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export type IStaticPath = (language: string, type?: string) => string | undefined;

export interface IComponentModule {
  hooks: IHooks;
  staticPath: IStaticPath;
}
