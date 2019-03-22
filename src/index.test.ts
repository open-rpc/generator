import clientGen from "./";
import fs from "fs";
import fsx from "fs-extra";
import path from "path";
import examples from "@open-rpc/examples";
import { promisify } from "util";
import { forEach } from "lodash";
import { types } from "@open-rpc/meta-schema";
import { parse } from "@open-rpc/schema-utils-js";

const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

describe(`Examples to generate Js clients`, () => {
  const testDir = `${process.cwd()}/test`;
  beforeAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  // afterAll(async () => {
  //   await fsx.emptyDir(testDir);
  //   return await rmdir(testDir);
  // });

  forEach(examples, (example: types.OpenRPC, exampleName: string) => {
    if (exampleName !== "simpleMath") { return; }
    it(`creates a new client for example: ${exampleName}`, async () => {
      expect.assertions(1);

      await clientGen({
        clientName: "test",
        schema: await parse(JSON.stringify(example)),
      });

      await expect(stat(`${process.cwd()}/test`)).resolves.toBeTruthy();
    }, 30000);

    it(`the generated lib can be imported ${example.info.title}`, async () => {
      const generated = require(`${testDir}/build/index.js`).default;
      expect(typeof generated).toBe("function");

      const instance = new generated({ transport: { type: "http" } });

      expect(instance).toBeInstanceOf(generated);
    });
  });
});
