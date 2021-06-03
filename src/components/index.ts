import defaultClientHooks from "./client"
import defaultDocHooks from "./docs"
import defaultServerHooks from "./server"
import { IComponentModule, IStaticPath } from "./types"
import path from "path"
export * from "./types"

export const getDefaultComponentTemplatePath: IStaticPath = (language: string, type?: string) => {
  const d = `/templates/${type}/${language}/`;
  return path.join(__dirname, "../../", d);
};

export const defaultClientComponent: IComponentModule= {
  hooks: defaultClientHooks,
  staticPath:  getDefaultComponentTemplatePath,
}

export const defaultDocComponent: IComponentModule= {
  hooks: defaultDocHooks,
  staticPath:  getDefaultComponentTemplatePath,
}

export const defaultServerComponent: IComponentModule= {
  hooks: defaultServerHooks,
  staticPath:  getDefaultComponentTemplatePath,
}