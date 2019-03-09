const clientGen = require('./');
const fs = require('fs');
const fsx = require('fs-extra');
const _bootstrapGeneratedPackage = require('./bootstrapGeneratedPackage');

it('rejects if there is an error', async () => {
  const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(
    jest.fn((a, cb) => cb(new Error(), 'blahblah'))
  );
  return expect(bootstrapGeneratedPackage('foobar'))
    .rejects
    .toEqual(new Error("blahblah"));
});
