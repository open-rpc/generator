const clientGen = require('./');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');

const { promisify } = require('util');
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

describe('index.js - clientGen', () => {
  const testDir = `${process.cwd()}/test`;

  beforeAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  afterAll(async () => {
    await fsx.emptyDir(testDir);
    return await rmdir(testDir);
  });

  it('creates a new client', async () => {
    expect.assertions(1);

    await clientGen({
      clientName: 'test',
      schema: 'https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json'
    });

    await expect(stat(`${process.cwd()}/test`)).resolves.toBeTruthy();
  }, 30000);

  describe('the generated lib', () => {
    it('can be imported', () => {
      const generated = require(`${testDir}/dist/test.js`).default;
      expect(typeof generated).toBe('function');

      const instance = new generated({ transport: { type: 'http' } });

      expect(instance).toBeInstanceOf(generated)
    });
  });
});
