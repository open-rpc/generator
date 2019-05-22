import clientGen from "./";
import fs from "fs";
import fsx, { emptyDir } from "fs-extra";
import examples from "@open-rpc/examples";
import { promisify } from "util";
import { forEach } from "lodash";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";

const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

describe(`Examples to generate Js clients`, () => {
  const testDir = `${process.cwd()}/test`;

  beforeAll(async () => {
    await emptyDir(testDir);
  });

  afterAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  forEach(examples, (example: OpenRPC, exampleName: string) => {
    it(`creates a new client for example: ${exampleName}`, async () => {
      const exampleOutDir = `${testDir}/${exampleName}`;
      expect.assertions(1);

      const cwd = process.cwd();
      await clientGen({
        openrpcDocument: await parseOpenRPCDocument(example),
        outDir: exampleOutDir,
        tsName: "template-client",
      });

      await expect(stat(exampleOutDir)).resolves.toBeTruthy();
    }, 60000);
  });
});
