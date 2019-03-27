import { IGenerator, TGetMethodTypingsMap, TGetFunctionSignature, IContentDescriptorTyping } from "./generator-interface";
import _ from "lodash";
import { types } from "@open-rpc/meta-schema";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { compile } from "json-schema-to-typescript";
import { quicktype, SchemaTypeSource } from "quicktype";
import { RegexLiteral } from "@babel/types";

const getTypeName = (contentDescriptor: types.ContentDescriptorObject): string => {
  return _.chain(contentDescriptor.name).camelCase().upperFirst().value();
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
      name: getTypeName(contentDescriptor),
      schema: JSON.stringify(contentDescriptor.schema),
    } as SchemaTypeSource))
    .uniqBy("name")
    .value();

  const recursiveGetLast = (arr: any): any => {
    const lastItem = _.last(arr);
    if (_.isArray(lastItem)) {
      return recursiveGetLast(lastItem);
    } else {
      return arr;
    }
  };

  const deriveString = "#[derive(Serialize, Deserialize)]";
  const untaggedString = "#[serde(untagged)]";
  const typeLinesNested = await Promise.all(
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
          .reduce((memoLines, line) => {
            const lastItem = recursiveGetLast(memoLines);
            const interfaceMatch = line.match(/pub (struct|enum) (.*) {/);

            if (interfaceMatch) {
              const toAdd = [deriveString];

              if (interfaceMatch[1] === "enum") {
                toAdd.push(untaggedString);
              }

              toAdd.push(line);

              memoLines.push(toAdd);
            } else if (_.isArray(lastItem)) {
              lastItem.push(line);
              if (line === "}") {
                memoLines.push("");
              }
            } else {
              memoLines.push(line);
            }

            return memoLines;
          }, [] as any)
          .filter((line) => line !== untaggedString)
          .filter((line) => line !== deriveString)
          .compact()
          .value(),
      ),
    ),
  );

  const typeLines = _.flatten(typeLinesNested);
  console.log(typeLines);

  const typeRegexes = {
    alias: /pub type (.*) = (.*)\;/,
    decleration: /use (.*)\;/,
    enum: /pub enum (.*) {/,
    struct: /pub struct (.*) {/,
  };

  const simpleTypes = _.filter(typeLines, (line) => typeof line === "string");
  const complexTypes = _.filter(typeLines, (line) => _.isArray(line));

  const useDeclerationTypes = _.filter(simpleTypes, (line) => typeRegexes.decleration.test(line.toString()));
  const aliasTypes = _.filter(simpleTypes, (line) => typeRegexes.alias.test(line.toString()));
  const structTypes = _.filter(complexTypes, (lines: string[]) => typeRegexes.struct.test(lines[1]));
  const enumTypes = _.filter(complexTypes, (lines: string[]) => typeRegexes.enum.test(lines[2]));

  console.log("------ Current Typings -----");
  console.log("useDeclerations", useDeclerationTypes);
  console.log("aliasTypes", aliasTypes);
  console.log("structTypes", structTypes);
  console.log("enumTypes", enumTypes);
  console.log("------ END Current Typings -----");

  const uniqueStructTypes = _.uniqBy(structTypes, (lines: any) => {
    const lineMatch = lines[1].match(/pub (struct|enum) (.*) {/);
    if (lineMatch === null || typeof lineMatch[2] !== "string") {
      throw new Error("Could not find the name of the complex type. " + lines.join("\n"));
    }

    return lineMatch[2]; // typeName
  });

  const allTypings = _.flatten([
    ...useDeclerationTypes,
    ...aliasTypes,
    ...enumTypes,
    ...uniqueStructTypes,
  ]).join("\n");

  const typings = _.chain(methods)
    .map((method) => {
      const r = [];
      const result = method.result as types.ContentDescriptorObject;
      const params = method.params as types.ContentDescriptorObject[];

      const resultTypeName = getTypeName(result);
      if (result.schema) {
        r.push({
          typeId: generateMethodResultId(method, result),
          typeName: resultTypeName,
          typing: "",
        });
      } else {
        console.log("WHAT THE FUCK");
        console.log(result);
        r.push({
          typeId: generateMethodResultId(method, result),
          typeName: resultTypeName,
          typing: `\npub type ${resultTypeName} = Option<serde_json::Value>;`,
        });
      }

      _.each(params, (param) => {
        const typeName = getTypeName(param);
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

  typings[Object.keys(typings)[0]].typing += allTypings;

  return typings;
};

const getFunctionSignature: TGetFunctionSignature = (method, typeDefs) => {
  const mResult = method.result as types.ContentDescriptorObject;
  console.log(typeDefs);
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
