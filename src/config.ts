export interface IClientConfig {
  type: 'client';
  name: string;
  language: 'typescript' | 'rust';
  outPath?: string;
}

export interface IServerConfig {
  type: 'server';
  name: string;
  language: 'typescript';
  outPath?: string;
}

export interface IDocsExtraConfig {
  docsPath?: string;
  gatsbyConfigPath?: string;
  staticPath?: string;
}

export interface IDocsConfig {
  type: 'docs';
  name: string;
  language: 'gatsby';
  outPath?: string;
  extraConfig?: IDocsExtraConfig;
}

// Experimental
export interface ICustomConfig {
  type: 'custom';
  name: string;
  customComponent: string;
  customType?: string;
  openRPCPath?: string | null;
  outPath?: string;
  language: 'typescript' | 'rust';
}

export type TComponentConfig = IClientConfig | IServerConfig | IDocsConfig | ICustomConfig;
