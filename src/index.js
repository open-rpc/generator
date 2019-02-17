#!/usr/bin/env node
const _ = require('lodash');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const fsx = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');
const parseSchema = require('@open-rpc/schema-utils-js');

const cwd = process.cwd();


const jsTemplate = require('../templates/js/templated/exported-class.template');

const cleanBuildDir = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);
};

const compileTemplate = async (name, schema) => {
  return jsTemplate({ className: name, methods: schema.methods });
}

const copyStatic = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, '../', '/templates/js/static');
  fsx.copy(staticPath, destinationDirectoryName);
};

const bootstrapGeneratedPackage = (destinationDirectoryName) => {
  return new Promise(
    (resolve) => exec(`cd ${destinationDirectoryName} && npm install && npm run build`, resolve)
  );
};

module.exports = async ({clientName, schema}) => {
  const parsedSchema = await parseSchema(schema);
  const compiledResult = await compileTemplate(clientName, parsedSchema);

  const destinationDirectoryName = `${cwd}/${clientName}`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName);
  await writeFile(`${destinationDirectoryName}/${clientName}.ts`, compiledResult, 'utf8');

  await bootstrapGeneratedPackage(destinationDirectoryName);
  return true;
};
