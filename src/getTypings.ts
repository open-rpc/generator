import { compile } from "json-schema-to-typescript";
import { types } from "@open-rpc/meta-schema";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { map, chain, startCase } from "lodash";
const promiseSeries = require("promise-series");

import * as fs from "fs";
import { promisify } from "util";
const writeFile = promisify(fs.writeFile);

import { quicktype, JSONTypeSource, SchemaTypeSource, RendererOptions } from "quicktype";
import * as qtCore from "quicktype-core";
import _ from "lodash";

interface IMethodTyping {
  typeId: string;
  typeName: string;
  typing: string;
}

interface IMethodTypingsMap {
  [k: string]: IMethodTyping;
}

const getTypeName = (contentDescriptor: types.ContentDescriptorObject): string => {
  const { schema } = contentDescriptor;

  const interfaceTypes = ["object"];
  let prefix = "T";
  if (schema && schema.type && interfaceTypes.includes(schema.type)) {
    prefix = "I";
  }

  const contentDescriptorName = startCase(contentDescriptor.name).replace(/\s/g, "");

  return `${prefix}${contentDescriptorName}`;
};

const getTypeNameRS = (contentDescriptor: types.ContentDescriptorObject): string => {
  return _.capitalize(contentDescriptor.name);
};

interface IContentDescriptorTyping {
  typeId: string;
  typeName: string;
  typing: string;
}

const getTypingForContentDescriptor = async (
  method: types.MethodObject,
  isParam: boolean,
  contentDescriptor: types.ContentDescriptorObject,
  lang?: string,
): Promise<IContentDescriptorTyping> => {
  const generateId = isParam ? generateMethodParamId : generateMethodResultId;
  let typeName;
  let _typing;
  if (lang === "rust") {
    typeName = getTypeNameRS(contentDescriptor);
    const resultLines = await quicktype({
      lang,
      rendererOptions: { "just-types": "true" },
      sources: [
        {
          kind: "schema",
          name: typeName,
          schema: JSON.stringify(contentDescriptor.schema),
        } as SchemaTypeSource,
      ],
    }).then((result) => result.lines);

    _typing = _.filter(resultLines, (line) => !_.startsWith(line, "//"))
      .join("\n");
  } else {
    lang = "typescript";
    typeName = getTypeName(contentDescriptor);
    _typing = await compile(
      contentDescriptor.schema || {},
      typeName,
      { bannerComment: "", declareExternallyReferenced: false },
    );
  }

  const typing = {
    typeId: generateId(method, contentDescriptor),
    typeName,
    typing: _typing,
  };

  if (contentDescriptor.schema === undefined || contentDescriptor.schema.type === undefined) {
    typing.typing = `export type ${typeName} = any; \n`;
  }

  return typing;
};

export const getMethodTypingsMap = async ({ methods }: types.OpenRPC, language: string): Promise<IMethodTypingsMap> => {
  const methodTypingsPromises = map(methods, async (method) => {
    const mparams = method.params as types.ContentDescriptorObject[];
    const mresult = method.result;

    const typingsForParams = await Promise.all(
      chain(mparams)
        .map((param) => param.schema ? param : { ...param, schema: {} })
        .map((param) => getTypingForContentDescriptor(method, true, param, language))
        .value(),
    );

    const typingsForResult = await getTypingForContentDescriptor(
      method,
      false,
      mresult as types.ContentDescriptorObject,
      language,
    );

    return [...typingsForParams, typingsForResult];
  });

  const methodTypings = await Promise.all(methodTypingsPromises);

  return chain(methodTypings)
    .flatten()
    .map((typing, i) => {
      if (i === 0) { return typing; }

      typing.typing = typing.typing.split("\n").filter((line) => line.indexOf("extern crate serde_json") === -1).join("\n");
      return typing;
    })
    .keyBy("typeId")
    .value();
};

export const getFunctionSignature = (method: types.MethodObject, typeDefs: IMethodTypingsMap): string => {
  const params = map(
    method.params as types.ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  const mResult = method.result as types.ContentDescriptorObject;
  const result = `Promise<${typeDefs[generateMethodResultId(method, mResult)].typeName}>`;

  return `public ${method.name}(${params}) : ${result}`;
};

export const getFunctionSignatureRS = (method: types.MethodObject, typeDefs: IMethodTypingsMap): string => {
  const params = map(
    method.params as types.ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  const mResult = method.result as types.ContentDescriptorObject;
  const result = `RpcRequest<${typeDefs[generateMethodResultId(method, mResult)].typeName}>`;

  return `pub fn ${method.name}(&mut self, ${params}) -> ${result};`;
};
