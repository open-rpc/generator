import clientGen from './';
import fs from 'fs';
import fsx, { emptyDir } from 'fs-extra';
import examples from '@open-rpc/examples';
import { promisify } from 'util';
import { forEach } from 'lodash';
import { OpenRPCDocumentDereferencingError } from '@open-rpc/schema-utils-js';
import { OpenrpcDocument as OpenRPC } from '@open-rpc/meta-schema';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);
console.error = () => 'noop';

describe(`Examples to generate Js clients`, () => {
  const testDir = `${process.cwd()}/test`;

  beforeAll(async () => {
    await emptyDir(testDir);
  });

  afterAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  it('fails when the open rpc document is invalid', () => {
    const testDocument = {
      openrpcDocument: {
        openrpc: '1.2.1',
        info: {
          version: '1',
          title: 'test',
        },
        methods: [
          {
            name: 'foo',
            params: [{ $ref: '#/components/contentDescriptors/LeFoo' }],
            result: {
              name: 'bar',
              schema: { $ref: '#/components/contentDescriptors/LeFoo' },
            },
          },
        ],
        components: {
          schemas: {
            LeBar: { title: 'LeBar', type: 'string' },
          },
          contentDescriptors: {
            LeFoo: {
              name: 'LeFoo',
              required: true,
              schema: { $ref: '#/components/schemas/LeBar' },
            },
          },
        },
      } as OpenRPC,
      outDir: testDir,
      components: [],
    };
    const genProm = clientGen(testDocument);

    return expect(genProm).rejects.toBeInstanceOf(OpenRPCDocumentDereferencingError);
  });

  forEach(examples, (example: OpenRPC, exampleName: string) => {
    it(`rejects configurations without outDir or outPath`, async () => {
      const promGen = clientGen({
        openrpcDocument: example,
        components: [{ type: 'client', language: 'typescript', name: 'testclient-ts' }],
      });
      expect(promGen).rejects.toBeInstanceOf(Error);
    });

    it(`creates a new client for example: ${exampleName} and regenerates after`, async () => {
      const exampleOutDir = `${testDir}/${exampleName}`;
      expect.assertions(5);

      await clientGen({
        openrpcDocument: example,
        outDir: exampleOutDir,
        components: [
          { type: 'client', language: 'rust', name: 'testclient-rs' },
          { type: 'client', language: 'typescript', name: 'testclient-ts' },
          { type: 'server', language: 'typescript', name: 'testserver-ts' },
          { type: 'docs', language: 'gatsby', name: 'testserver-gatsby' },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
          },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff2',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
            openRPCPath: null,
          },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff3',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
            openRPCPath: 'tmpz',
          },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff4',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
            openRPCPath: 'tmpy',
            outPath: `${exampleOutDir}/special`,
          },
        ],
      });

      await expect(stat(exampleOutDir)).resolves.toBeTruthy();
      await expect(stat(`${exampleOutDir}/special`)).resolves.toBeTruthy();

      await clientGen({
        openrpcDocument: example,
        outDir: exampleOutDir,
        components: [
          { type: 'client', language: 'rust', name: 'testclient-rs' },
          { type: 'client', language: 'typescript', name: 'testclient-ts' },
          { type: 'server', language: 'typescript', name: 'testserver-ts' },
          { type: 'docs', language: 'gatsby', name: 'testserver-gatsby' },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
          },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff2',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
            openRPCPath: null,
          },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff3',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
            openRPCPath: 'tmpz',
          },
          {
            type: 'custom',
            language: 'typescript',
            name: 'custom-stuff4',
            customComponent: './src/custom-test-component.js',
            customType: 'client',
            openRPCPath: 'tmpy',
            outPath: `${exampleOutDir}/special`,
          },
        ],
      });

      await expect(stat(`${exampleOutDir}/special`)).resolves.toBeTruthy();
      await expect(stat(exampleOutDir)).resolves.toBeTruthy();
    }, 100000);
  });
});
