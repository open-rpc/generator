import { compile } from "json-schema-to-typescript";
import { types } from "@open-rpc/meta-schema";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { map, chain, startCase } from "lodash";

import * as fs from "fs";
import { promisify } from "util";
const writeFile = promisify(fs.writeFile);

import * as Main from "quicktype";
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

const getTypingForContentDescriptor = async (
  method: types.MethodObject,
  isParam: boolean,
  contentDescriptor: types.ContentDescriptorObject,
  lang?: string,
) => {
  const generateId = isParam ? generateMethodParamId : generateMethodResultId;
  const typeName = getTypeName(contentDescriptor);

  let _typing;
  if (lang === "rust") {
    await writeFile("./tmp.json", JSON.stringify(contentDescriptor.schema), "utf8");
    const cliOptions = Main.parseCLIOptions([
      "--src", "./tmp.json",
      "--src-lang", "schema",
      "--top-level", typeName,
      "--lang", "rust",
      "--out", "./schema.rs",
    ]);
    const qtOpts = await Main.makeQuicktypeOptions(cliOptions) as Partial<Main.CLIOptions>;

    const resultsByFilename = await qtCore.quicktypeMultiFile(qtOpts);
    const result = resultsByFilename.get("schema.rs") as qtCore.SerializedRenderResult;

    _typing = _.chain(result.lines)
      .reject((line) => _.startsWith(line, "//"))
      .value()
      .join("\n");
  } else {
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
    const mparams = method.params;
    const mresult = method.result;

    const typingsForParams = await Promise.all(
      map(mparams, (param) => getTypingForContentDescriptor(method, true, param as types.ContentDescriptorObject, language)),
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

  return `pub fn ${method.name}(&mut self, ${params}) -> ${result}`;
};
