export interface IClientConfig {
  type: "client";
  name: string;
  language: "typescript" | "rust";
}

export interface IServerConfig {
  type: "server";
  name: string;
  language: "typescript";
}

export interface IDocsConfig {
  type: "docs";
  name: string;
  language: "gatsby";
}

// Experimental
export interface ICustomConfig {
  type: "custom";
  name: string;
  customComponent: string;
  customType?: string;
  language: "typescript" | "rust";
}

export type TComponentConfig = IClientConfig | IServerConfig | IDocsConfig | ICustomConfig;