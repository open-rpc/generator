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

  it.only("fails when the open rpc document is invalid", () => {
    return expect(clientGen({
      openrpcDocument: {
        openrpc: "1.2.1",
        info: {
          version: "1",
          title: "test",
        },
        methods: [
          {
            name: "foo",
            params: [
              { $ref: "#/components/contentDescriptors/LeFoo" },
            ],
            result: {
              name: "bar",
              schema: { $ref: "#/components/contentDescriptors/LeFoo" },
            },
          },
        ],
        components: {
          schemas: {
            LeBar: { title: "LeBar", type: "string" },
          },
          contentDescriptors: {
            LeFoo: {
              name: "LeFoo",
              required: true,
              schema: { $ref: "#/components/schemas/LeBar" },
            },
          },
        },
      },
      outDir: testDir,
      rsName: "template-client",
      tsName: "template-client",
    })).rejects.toThrow();
  });

  forEach(examples, (example: OpenRPC, exampleName: string) => {
    it(`creates a new client for example: ${exampleName}`, async () => {
      const exampleOutDir = `${testDir}/${exampleName}`;
      expect.assertions(1);

      await clientGen({
        openrpcDocument: await parseOpenRPCDocument(example),
        outDir: exampleOutDir,
        rsName: "template-client",
        tsName: "template-client",
      });

      await expect(stat(exampleOutDir)).resolves.toBeTruthy();
    }, 100000);
  });
});
