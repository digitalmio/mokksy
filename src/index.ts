#!/usr/bin/env node

import yargs from 'yargs';
import { pick } from 'lodash';
import { server } from './server';

// get package file to get version number
const pkg = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

// default config
const { argv } = yargs
  .usage('$0 [options] <sourceFile>')
  .options({
    port: {
      alias: 'p',
      description: 'Set port',
      default: 5000,
    },
    host: {
      alias: 'H',
      description: 'Set host',
      default: 'localhost',
    },
    apiUrlPrefix: {
      alias: 'api',
      description: `Prefix the URL path, ie. '/api' for '/api/posts'`,
      type: 'string',
      default: '',
    },
    idKey: {
      alias: 'i',
      description: `Set database 'ID' key (ie. '_id' for Mongo-like collections)`,
      type: 'string',
      default: 'id',
    },
    foreignKeySuffix: {
      alias: 'fks',
      description: `Set foreign key suffix.
                    Ie. '_id' for keys like 'user_id', 'post_id', etc.
                    Default is 'Id' for keys like 'userId', 'postId', etc.`,
      default: 'Id',
    },
    watch: {
      alias: 'w',
      description: 'Watch for changes on database file',
      type: 'boolean',
      default: false,
    },
    staticPath: {
      alias: 's',
      description: 'Set static files directory',
      type: 'string',
      default: 'public',
    },
    noStatic: {
      alias: 'ns',
      description: 'Disable static file server',
      type: 'boolean',
      default: false,
    },
    noCors: {
      alias: 'nc',
      description: 'Disable Cross-Origin Resource Sharing',
      type: 'boolean',
      default: false,
    },
    filtering: {
      alias: 'f',
      type: 'string',
      description: `Query params filtering type:
                    Inclusive (incl) - when element needs to match all filters.
                    Exclusive (excl) - when the element needs to match just one of the filters.`,
      choices: ['incl', 'excl'],
      default: 'incl',
    },
    noToken: {
      alias: 'nt',
      description: 'Disable JWT token endpoint',
      type: 'boolean',
      default: false,
    },
    tokenSecret: {
      alias: 'ts',
      type: 'string',
      description: 'Secret used to sign tokens on token endpoint',
      default: 'MoKKsy',
    },
    template: {
      alias: 't',
      type: 'string',
      description: `Template file path to format the response data. No template by default.`,
      default: '',
    },
  })
  .help('help', 'Show this help page')
  .alias('help', 'h')
  .alias('version', 'v')
  .version(pkg.version)
  .example('$0 db.json', '')
  .require(1, 'Missing the <sourceFile> argument.')
  .wrap(Math.min(100, yargs.terminalWidth()));

// run server
const confKeys = pick(argv, [
  'port',
  'host',
  'apiUrlPrefix',
  'idKey',
  'foreignKeySuffix',
  'watch',
  'staticPath',
  'noStatic',
  'noCors',
  'filtering',
  'noToken',
  'tokenSecret',
  'template',
]);

server({
  ...{
    filename: argv._[0],
  },
  ...confKeys,
});
