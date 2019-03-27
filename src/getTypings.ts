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
import { ContentDescriptorObject } from "@open-rpc/meta-schema/build/src/types";

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

    if (contentDescriptor.schema === undefined || contentDescriptor.schema.type === undefined) {
      _typing = `pub type ${typeName} = Option<serde_json::Value>; \n`;
    } else {
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
    }
  } else {
    typeName = getTypeName(contentDescriptor);

    if (contentDescriptor.schema === undefined || contentDescriptor.schema.type === undefined) {
      _typing = `export type ${typeName} = any; \n`;
    } else {
      _typing = await compile(
        contentDescriptor.schema || {},
        typeName,
        { bannerComment: "", declareExternallyReferenced: false },
      );
    }
  }

  const typing = {
    typeId: generateId(method, contentDescriptor),
    typeName,
    typing: _typing,
  };

  return typing;
};

export const getMethodTypingsMap = async (openrpcSchema: types.OpenRPC, language: string): Promise<IMethodTypingsMap> => {
  switch (language) {
    case "rust":
      return _getMethodTypingsMapRS(openrpcSchema);
    default:
      return _getMethodTypingsMap(openrpcSchema);
  }
};

const _getMethodTypingsMapRS = async ({ methods }: types.OpenRPC): Promise<IMethodTypingsMap> => {
  const allContentDescriptors = [
    ..._.chain(methods).map('params').flatten().value(),
    ..._.map(methods, 'result'),
  ] as types.ContentDescriptorObject[];

  const sources = _.chain(allContentDescriptors)
    .filter((contentDescriptor) => !!contentDescriptor.schema)
    .map((contentDescriptor) => ({
      kind: "schema",
      name: getTypeNameRS(contentDescriptor),
      schema: JSON.stringify(contentDescriptor.schema),
    } as SchemaTypeSource))
    .uniqBy("name")
    .value();

  const otherTypesLines = await Promise.all(
    _.map(
      sources,
      (source) => quicktype({
        lang: "rust",
        leadingComments: undefined,
        rendererOptions: { "just-types": "true" },
        sources: [source],
      }).then(
        (result) => _.chain(result.lines)
          .filter((line) => !_.startsWith(line, "//"))
          .filter((line) => !_.startsWith(line, "extern"))
          .compact()
          .value(),
      ),
    ),
  );

  const otherTypesFlat = _.compact(_.flatten(otherTypesLines));

  const primitiveTypes = _.filter(otherTypesFlat, (line) => _.startsWith(line, "pub") && _.endsWith(line, ";"));
  const withoutPrimitiveTypes = _.pullAll(otherTypesFlat, primitiveTypes);
  const deriveString = "#[derive(Serialize, Deserialize)]";
  const structTypes = deriveString + _.chain(withoutPrimitiveTypes.join("\n").split(deriveString))
    .compact()
    .groupBy(
      (structString: string) => {
        const typeName = structString.match(/pub (struct|enum) (.*) {/);
        return typeName ? typeName[2] : "noname";
      },
    )
    .map((groupingValues, groupingName) => groupingValues[0])
    .value()
    .join(deriveString)
    .concat(primitiveTypes.join("\n"));

  const withSchemaTypes = _.chain(methods)
    .map((method) => {
      const r = [];
      const result = method.result as types.ContentDescriptorObject;
      const params = method.params as types.ContentDescriptorObject[];
      if (result.schema) {
        r.push({
          typeId: generateMethodResultId(method, result),
          typeName: getTypeNameRS(result),
          typing: "",
        });
      }

      _.each(params, (param) => {
        if (param.schema) {
          r.push({
            typeId: generateMethodParamId(method, param),
            typeName: getTypeNameRS(param),
            typing: "",
          });
        }
      });
      return r;
    })
    .flatten()
    .value();

  const noSchemaTypes = _.chain(methods)
    .map((method) => {
      const r = [];
      const result = method.result as ContentDescriptorObject;
      const params = method.params as ContentDescriptorObject[]

      if (!result.schema) {
        const typeName = getTypeNameRS(result);
        r.push({
          typeId: generateMethodResultId(method, result),
          typeName,
          typing: `pub type ${typeName} = Option<serde_json::Value>;`
        });
      }
      _.each(params, (param) => {
        if (!param.schema) {
          const typeName = getTypeNameRS(param);
          r.push({
            typeId: generateMethodParamId(method, param),
            typeName,
            typing: `pub type ${typeName} = Option<serde_json::Value>;`
          });
        }
      });
      return r;
    })
    .flatten()
    .value();

  console.log(noSchemaTypes);
  console.log(withSchemaTypes);

  const typings = _.chain(withSchemaTypes)
    .concat(noSchemaTypes)
    .keyBy("typeId")
    .value();

  typings[Object.keys(typings)[0]].typing = structTypes;

  return typings;
};

const _getMethodTypingsMap = async ({ methods }: types.OpenRPC): Promise<IMethodTypingsMap> => {
  const methodTypingsPromises = map(methods, async (method) => {
    const mparams = method.params as types.ContentDescriptorObject[];
    const mresult = method.result;

    const typingsForParams = await Promise.all(
      chain(mparams)
        .map((param) => param.schema ? param : { ...param, schema: {} })
        .map((param) => getTypingForContentDescriptor(method, true, param, "typescript"))
        .value(),
    );

    const typingsForResult = await getTypingForContentDescriptor(
      method,
      false,
      mresult as types.ContentDescriptorObject,
      "typescript",
    );

    return [...typingsForParams, typingsForResult];
  });

  const methodTypings = await Promise.all(methodTypingsPromises);

  const finalTypings = chain(methodTypings)
    .flatten()
    .map((typing, i) => {
      typing.typing = typing.typing.replace(/extern crate serde_json;/g, "");
      return typing;
    })
    .keyBy("typeId")
    .value();

  console.log(_.chain(finalTypings).values().uniqBy("typeName").value());

  return finalTypings;
};

export const getFunctionSignature = (method: types.MethodObject, typeDefs: IMethodTypingsMap): string => {
  const mResult = method.result as types.ContentDescriptorObject;
  const result = `Promise<${typeDefs[generateMethodResultId(method, mResult)].typeName}>`;

  if (method.params.length === 0) {
    return `public ${method.name}() : ${result}`;
  }

  const params = map(
    method.params as types.ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  return `public ${method.name}(${params}) : ${result}`;
};

export const getFunctionSignatureRS = (method: types.MethodObject, typeDefs: IMethodTypingsMap): string => {
  const mResult = method.result as types.ContentDescriptorObject;
  const result = `RpcRequest<${typeDefs[generateMethodResultId(method, mResult)].typeName}>`;

  if (method.params.length === 0) {
    return `pub fn ${method.name}(&mut self) -> ${result};`;
  }

  const params = map(
    method.params as types.ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  return `pub fn ${method.name}(&mut self, ${params}) -> ${result};`;
};
