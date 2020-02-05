import * as path from "path";
import { move, ensureDir } from "fs-extra";
import { IHooks } from "..";
import * as fs from "fs";
import { promisify } from "util";
import { template } from "lodash";
import { ContentDescriptorObject, ExamplePairingObject, ExamplePairingObjectresult, ExampleObject } from "@open-rpc/meta-schema";
const writeFile = promisify(fs.writeFile);

const onlyHandleTS = ({ language }: any) => {
  if (language !== "typescript") {
    throw new Error("Cannot handle any other language other than TS for server generator");
  }
};

const methodMappingTemplate = template(`// Code generated by @open-rpc/generator DO NOT EDIT or ur gonna have a bad tiem
import { IMethodMapping } from "@open-rpc/server-js/build/router";

import methods from "./methods";

export const methodMapping: IMethodMapping = {
<% openrpcDocument.methods.forEach(({ name }) => { %>  <%= name %>: methods.<%= name %>,
<% }); %>};

export default methodMapping;
`);

const generatedTypingsTemplate = template(`<%= methodTypings.toString("typescript") %>`);

const hooks: IHooks = {
  afterCopyStatic: [
    async (dest, frm, component) => {
      onlyHandleTS(component);
      move(path.join(dest, "_package.json"), path.join(dest, "package.json"));
    },
  ],
  afterCompileTemplate: [
    async (dest, frm, component, openrpcDocument, typings) => {
      onlyHandleTS(component);

      const methodsFolder = `${dest}/src/methods/`;
      await ensureDir(methodsFolder);

      // Only write new one if there isnt one already.
      await Promise.all(openrpcDocument.methods.map(async (method) => {
        const functionAliasName = typings.getTypingNames("typescript", method).method;
        const params = method.params as ContentDescriptorObject[];
        const functionParams = params.map(({ name }) => name).join(", ");
        let returnVal = "";
        if (method.examples) {
          const example = method.examples[0] as ExamplePairingObject;
          const exRes = example.result as ExampleObject;
          returnVal = exRes.value;
        }

        const templateStr = [
          `import { ${functionAliasName} } from "../generated-typings";`,
          "",
          `const ${method.name}: ${functionAliasName} = (${functionParams}) => {`,
          `  return Promise.resolve(${returnVal});`,
          `};`,
          "",
          `export default ${method.name};`,
          "",
        ].join("\n");

        await writeFile(`${methodsFolder}/${method.name}.ts`, templateStr, "utf8");
      }));

      // Need a step that cleans out deleted methods

      const imports = openrpcDocument.methods.map(({ name }) => `import ${name} from "./${name}";`);
      const methodMappingStr = [
        "const methods = {",
        ...openrpcDocument.methods.map(({ name }) => `  ${name},`),
        "};",
      ];

      const defaultExportStr = "export default methods;";

      await writeFile(
        `${methodsFolder}/index.ts`,
        [...imports, "", ...methodMappingStr, "", defaultExportStr, ""].join("\n"),
        "utf8",
      );
    },
  ],
  templateFiles: {
    typescript: [
      {
        path: "src/generated-method-mapping.ts",
        template: methodMappingTemplate,
      },
      {
        path: "src/generated-typings.ts",
        template: generatedTypingsTemplate,
      },
    ],
  },
};

export default hooks;
