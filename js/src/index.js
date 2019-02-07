#!/usr/bin/env node
const _ = require('lodash');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const fsx = require('fs-extra');
const refParser = require('json-schema-ref-parser');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');
const parseSchema = require('@open-rpc/schema-utils-js');

const cwd = process.cwd();

const cleanBuildDir = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);
};

const compileTemplate = async (name, schema) => {
  const templatePath = path.join(__dirname, '../', '/client-templated/exported-class.ts.tmpl');
  const templates = await readFile(templatePath, 'utf-8');

  const compile = _.template(templates);
  return compile({ className: name, methods: schema.methods });
}

const copyStatic = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, '../', '/client-static');
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
