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
const bootstrapGeneratedPackage = require('./bootstrapGeneratedPackage')(exec);
const cwd = process.cwd();
const { compile, compileFromFile } = require('json-schema-to-typescript');

const jsTemplate = require('../templates/js/templated/exported-class.template');
const { makeIdForMethodContentDescriptors } = require("@open-rpc/schema-utils-js");

const cleanBuildDir = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);
};

const getTypeName = (contentDescriptor) => {
  const {schema} = contentDescriptor;
  // TODO: Remove this when we've fixed things to ensure name is a required field
  if (!contentDescriptor.name) { contentDescriptor.name = 'BROKEN'; }

  const primitiveTypes = ["string", "number", "integer", "boolean", "null"];
  let prefix = "T";
  if (schema.type && primitiveTypes.includes(schema.type)) {
    prefix = 'I';
  }

  const contentDescriptorName = _.startCase(contentDescriptor.name).replace(/\s/g, '');

  return `${prefix}${contentDescriptorName}`;
};

const getTypings = async ({ methods }) => {
  const contentDescriptors = _(methods)
    .map((method) => ({
      method,
      contentDescriptors: [...method.params, method.result]
    }))
    .flatMap(({ method, contentDescriptors }) => _.map(contentDescriptors, (contentDescriptor) => ({
      method,
      contentDescriptor
    })))
    .filter(({ contentDescriptor }) => contentDescriptor.schema !== undefined)
    .map(async ({ method, contentDescriptor }) => ({
      typeId: makeIdForMethodContentDescriptors(method, contentDescriptor),
      typeName: getTypeName(contentDescriptor),
      typings: await compile(contentDescriptor.schema, getTypeName(contentDescriptor), { bannerComment: '' })
    }))
    .value();

  const typingsToAddToTemplate = await Promise.all(contentDescriptors);

  return _(typingsToAddToTemplate)
    .keyBy('typeId')
    .value();
};

const compileTemplate = async (name, schema) => {
  const typeDefs = await getTypings(schema);
  return jsTemplate({ className: name, methods: schema.methods, typeDefs, makeIdForMethodContentDescriptors });
}

const copyStatic = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, '../', '/templates/js/static');
  await fsx.copy(staticPath, destinationDirectoryName);
  await fsx.move(path.join(destinationDirectoryName, '_package.json'), path.join(destinationDirectoryName, 'package.json'));
};

module.exports = async ({clientName, schema}) => {
  const compiledResult = await compileTemplate(clientName, schema);

  const destinationDirectoryName = `${cwd}/${clientName}`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName);
  await writeFile(`${destinationDirectoryName}/index.ts`, compiledResult, 'utf8');

  await bootstrapGeneratedPackage(destinationDirectoryName);
  return true;
};
