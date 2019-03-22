import { compile } from "json-schema-to-typescript";
import { types } from "@open-rpc/meta-schema";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { map, chain, startCase } from "lodash";

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
) => {
  const generateId = isParam ? generateMethodParamId : generateMethodResultId;
  const typeName = getTypeName(contentDescriptor);
  const typing = {
    typeId: generateId(method, contentDescriptor),
    typeName,
    typing: await compile(
      contentDescriptor.schema || {},
      typeName, { bannerComment: "", declareExternallyReferenced: false },
    ),
  };

  if (contentDescriptor.schema === undefined || contentDescriptor.schema.type === undefined) {
    typing.typing = `export type ${typeName} = any; \n`;
  }

  return typing;
};

export const getMethodTypingsMap = async ({ methods }: { methods: [any] }): Promise<IMethodTypingsMap> => {
  const methodTypingsPromises = map(methods, async (method) => {
    const mparams = method.params;
    const mresult = method.result;

    const typingsForParams = await Promise.all(
      map(mparams, (param) => getTypingForContentDescriptor(method, true, param)),
    );

    const typingsForResult = await getTypingForContentDescriptor(method, false, mresult);

    return [...typingsForParams, typingsForResult];
  });

  const methodTypings = await Promise.all(methodTypingsPromises);

  return chain(methodTypings)
    .flatten()
    .keyBy("typeId")
    .value();
};
