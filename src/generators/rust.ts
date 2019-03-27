import { IGenerator, TGetMethodTypingsMap, TGetFunctionSignature, IContentDescriptorTyping } from "./generator-interface";
import _ from "lodash";
import { types } from "@open-rpc/meta-schema";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { compile } from "json-schema-to-typescript";
import { quicktype, SchemaTypeSource } from "quicktype";

const getTypeNameRS = (contentDescriptor: types.ContentDescriptorObject): string => {
  return _.capitalize(contentDescriptor.name);
};

const getMethodTypingsMap: TGetMethodTypingsMap = async (openrpcSchema) => {
  const { methods } = openrpcSchema;

  const allContentDescriptors = [
    ..._.chain(methods).map("params").flatten().value(),
    ..._.map(methods, "result"),
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
  const deriveString = "#[derive(Serialize, Deserialize)]\n";

  let structTypesArray = _.chain(withoutPrimitiveTypes.join("\n").split(deriveString))
    .compact()
    .map((structString) => structString.split("\n"))
    .map(_.compact)
    .uniqBy( // If I keyBy here instead, I could have the typigns properly distributed...
      (lines: string[]) => {
        const lineMatch = lines[0].match(/pub (struct|enum) (.*) {/);
        if (lineMatch === null || typeof lineMatch[2] !== "string") {
          throw new Error("Could not find the name of the complex type. " + lines.join("\n"));
        }

        return lineMatch[2]; // typeName
      },
    )
    .map((lines) => lines.join("\n"))
    .value();

  if (structTypesArray.length > 0) {
    structTypesArray = [
      "", // when joined, this will put a deriveString on the first line(as is needed)
      ...structTypesArray,
    ];
  }

  const structTypes = structTypesArray.join(deriveString)
    .concat("\n" + primitiveTypes.join("\n"));

  const typings = _.chain(methods)
    .map((method) => {
      const r = [];
      const result = method.result as types.ContentDescriptorObject;
      const params = method.params as types.ContentDescriptorObject[];

      const resultTypeName = getTypeNameRS(result);
      if (result.schema) {
        r.push({
          typeId: generateMethodResultId(method, result),
          typeName: resultTypeName,
          typing: "",
        });
      } else {
        r.push({
          typeId: generateMethodResultId(method, result),
          typeName: resultTypeName,
          typing: `\npub type ${resultTypeName} = Option<serde_json::Value>;`,
        });
      }

      _.each(params, (param) => {
        const typeName = getTypeNameRS(param);
        if (param.schema) {
          r.push({
            typeId: generateMethodParamId(method, param),
            typeName,
            typing: "",
          });
        } else {
          r.push({
            typeId: generateMethodParamId(method, param),
            typeName,
            typing: `\npub type ${typeName} = Option<serde_json::Value>;`,
          });
        }
      });
      return r;
    })
    .flatten()
    .keyBy("typeId")
    .value();

  typings[Object.keys(typings)[0]].typing += structTypes;

  return typings;
};

const getFunctionSignature: TGetFunctionSignature = (method, typeDefs) => {
  const mResult = method.result as types.ContentDescriptorObject;
  const result = `RpcRequest<${typeDefs[generateMethodResultId(method, mResult)].typeName}>`;

  if (method.params.length === 0) {
    return `pub fn ${method.name}(&mut self) -> ${result};`;
  }

  const params = _.map(
    method.params as types.ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  return `pub fn ${method.name}(&mut self, ${params}) -> ${result};`;
};

const generator: IGenerator = {
  getFunctionSignature,
  getMethodTypingsMap,
};

export default generator;
