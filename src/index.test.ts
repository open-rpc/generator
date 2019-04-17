import clientGen from "./";
import fs from "fs";
import fsx from "fs-extra";
import examples from "@open-rpc/examples";
import { promisify } from "util";
import { forEach } from "lodash";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";

const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);
const readFile = promisify(fs.readFile);

describe(`Examples to generate Js clients`, () => {
  const testDir = `${process.cwd()}/test`;
  beforeAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  afterAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  forEach(examples, (example: OpenRPC, exampleName: string) => {
    it(`creates a new client for example: ${exampleName}`, async () => {
      expect.assertions(1);

      await clientGen({
        clientName: "test",
        schema: await parseOpenRPCDocument(example),
      });

      await expect(stat(testDir)).resolves.toBeTruthy();
    }, 60000);

    it(`creates generated code annotation`, async () => {
      const fileData = await readFile(`${testDir}/ts/src/index.ts`, "utf8");
      expect(fileData.match("// Code generated .* DO NOT EDIT\.")).not.toBe(null);
    });

    it(`the generated lib can be imported ${example.info.title}`, async () => {
      const generated = require(`${testDir}/ts/build/index.js`).default;
      expect(typeof generated).toBe("function");

      const instance = new generated({ transport: { type: "http" } });

      expect(instance).toBeInstanceOf(generated);
    });
  });
});
