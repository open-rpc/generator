import { types } from "@open-rpc/meta-schema";

export interface IContentDescriptorTyping {
  typeId: string;
  typeName: string;
  typing: string;
}

export interface IMethodTypingsMap {
  [k: string]: IContentDescriptorTyping;
}

export type TGetMethodTypingsMap = (openrpcSchema: types.OpenRPC) => Promise<IMethodTypingsMap>;
export type TGetFunctionSignature = (method: types.MethodObject, typeDefs: IMethodTypingsMap) => string;

export interface IGenerator {
  getMethodTypingsMap: TGetMethodTypingsMap;
  getFunctionSignature: TGetFunctionSignature;
}
