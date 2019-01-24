const clientGen = require('./');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');

const { promisify } = require('util');
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

describe('index.js - clientGen', () => {

  it('creates a new client', async () => {
    expect.assertions(1);
    const testDir = path.join('__dirname/', '../', 'test');
    await fsx.emptyDir(testDir);
    await rmdir(testDir);

    await clientGen({
      clientName: 'test',
      openrpcjson: 'https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json'
    });

    await expect(stat(`${process.cwd()}/test`)).resolves.toBeTruthy();

    await fsx.emptyDir(testDir);
    await rmdir(testDir);
  }, 30000);
});
