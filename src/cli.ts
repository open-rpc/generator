#!/usr/bin/env node
import program from 'commander';
import orpcGenerator, { IGeneratorOptions } from './index';
import { input, checkbox } from '@inquirer/prompts';
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js';
import { capitalize } from 'lodash';
import * as fs from 'fs';
import { promisify } from 'util';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/* eslint-disable-next-line */
const version = require("../package.json").version;

/* eslint-disable @typescript-eslint/no-explicit-any */
program
  .version(version, '-v, --version')
  .command('init')
  .action(async () => {
    // Define a proper type for our answers
    interface InitAnswers {
      document: string;
      outDir: string;
      componentTypes: string[];
      docsLanguages: string[];
      clientLanguages: string[];
      serverLanguages: string[];
      gatsbyDocsName?: string;
      typescriptClientName?: string;
      rustClientName?: string;
      typescriptServerName?: string;
      [key: string]: any; // Allow dynamic access with string indices
    }

    // Use sequential prompts instead of an array
    const document = await input({
      message: 'Where is your OpenRPC document? May be a file path or url.',
      default: 'openrpc.json',
      validate: async (d: string) => {
        try {
          await parseOpenRPCDocument(d);
        } catch (e: any) {
          return `Invalid document. The error recieved: ${e.message}`;
        }
        return true;
      },
    });

    const outDir = await input({
      message: 'Where would you like to write the generated artifacts?',
      default: './',
    });

    const componentTypes = await checkbox({
      message: 'Which components would you like to generate?',
      choices: [
        { name: 'client', value: 'client' },
        { name: 'server', value: 'server' },
        { name: 'docs', value: 'docs' },
      ],
    });

    // Initialize the answers object
    const initAnswers: InitAnswers = {
      document,
      outDir,
      componentTypes,
      docsLanguages: [],
      clientLanguages: [],
      serverLanguages: [],
    };

    // Conditional prompts based on component types
    if (componentTypes.includes('docs')) {
      initAnswers.docsLanguages = await checkbox({
        message: 'What type of documentation do you want to generate?',
        choices: [{ name: 'gatsby', value: 'gatsby' }],
      });

      if (initAnswers.docsLanguages.includes('gatsby')) {
        initAnswers.gatsbyDocsName = await input({
          message: 'What would you like the gatsby based docs package to be named?',
        });
      }
    }

    if (componentTypes.includes('client')) {
      initAnswers.clientLanguages = await checkbox({
        message: 'What language(s) would you like to generate a client for?',
        choices: [
          { name: 'typescript', value: 'typescript' },
          { name: 'rust', value: 'rust' },
        ],
      });

      if (initAnswers.clientLanguages.includes('typescript')) {
        initAnswers.typescriptClientName = await input({
          message: 'What would you like the typescript client package to be named?',
        });
      }

      if (initAnswers.clientLanguages.includes('rust')) {
        initAnswers.rustClientName = await input({
          message: 'What would you like the rust client crate to be named?',
        });
      }
    }

    if (componentTypes.includes('server')) {
      initAnswers.serverLanguages = await checkbox({
        message: 'What language(s) would you like to generate a server for?',
        choices: [{ name: 'typescript', value: 'typescript' }],
      });

      if (initAnswers.serverLanguages.includes('typescript')) {
        initAnswers.typescriptServerName = await input({
          message: 'What would you like the typescript server package to be named?',
        });
      }
    }

    /* eslint-enable @typescript-eslint/no-explicit-any */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const components: any = [];

    // eslint-disable-next-line no-console
    console.log('Here is a summary of your Generator configuration:');
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(initAnswers, undefined, '\t'));

    initAnswers.componentTypes.forEach((componentType: string) => {
      const languagesKey = `${componentType}Languages` as keyof InitAnswers;
      // Add a type guard to ensure the property exists and is an array
      const languages = initAnswers[languagesKey];
      if (Array.isArray(languages)) {
        languages.forEach((language: string) => {
          const nameKey = `${language}${capitalize(componentType)}Name` as keyof InitAnswers;
          components.push({
            type: componentType,
            name: initAnswers[nameKey],
            language,
          });
        });
      }
    });

    const config = {
      openrpcDocument: initAnswers.document,
      outDir: initAnswers.outDir,
      components,
    };

    // eslint-disable-next-line no-console
    console.log('Writing your config...');
    await writeFile(
      './open-rpc-generator-config.json',
      JSON.stringify(config, undefined, '    '),
      'utf8'
    );
    // eslint-disable-next-line no-console
    console.log(
      'Config created at open-rpc-generator-config.json. To generate components for the first time run:'
    );
    // eslint-disable-next-line no-console
    console.log('open-rpc-generator generate -c ./open-rpc-generator-config.json ');
  });

program
  .command('generate')
  .option(
    '-d, --document [openrpcDocument]',
    'JSON string or a Path/Url pointing to an open rpc schema',
    './openrpc.json'
  )
  .option(
    '-o, --outputDir [outputDirectory]',
    'output directory that the clients will be generated into',
    './'
  )
  .option(
    '-c, --config [generatorConfigPath]',
    'Path to a JSON file with declarative generator config'
  )
  .option('-t, --type [type]', 'component type')
  .option('-l, --language [language]', 'component language')
  .option('-n, --useName [useName]', 'Name to use for the generated component')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .action(async (opts: any) => {
    const outDir = opts.outputDir || process.cwd();

    let config = {
      openrpcDocument: opts.document,
      outDir,
      components: [],
    } as IGeneratorOptions;

    if (opts.config) {
      config = {
        ...config,
        ...JSON.parse(await readFile(opts.config, 'utf8')),
      };
    } else {
      config.components.push({
        type: opts.type,
        name: opts.useName,
        language: opts.language,
      });
    }

    try {
      await orpcGenerator(config);
    } catch (e) {
      console.error('There was error at generator runtime:');
      console.error(e);
      process.exit(1);
    }

    // eslint-disable-next-line no-console
    console.log('Done!');
  });

program.parseAsync(process.argv);
