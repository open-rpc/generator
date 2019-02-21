const clientGen = require('./');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');

const { promisify } = require('util');
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

const { exec } = require('child_process');

jest.mock('jayson', () => ({
  client: {
    http: jest.fn()
  }
}));
const jayson = require('jayson');

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

  it('can run tests inside generated lib', (cb) => {
    exec(`cd ${process.cwd()}/test && npm test`, (err, result, otherresult) => {
      console.log(err, result, otherresult);
      cb();
    }, 30000);
  });
});
