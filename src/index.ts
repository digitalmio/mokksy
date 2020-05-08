#!/usr/bin/env node

import yargs from 'yargs';
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
    watch: {
      alias: 'w',
      description: 'Watch for changes on database file',
      type: 'boolean',
      default: false,
    },
    static: {
      alias: 's',
      description: 'Set static files directory',
      type: 'string',
    },
    noStatic: {
      alias: 'ns',
      description: 'Disable static file server.',
      type: 'boolean',
    },
    noCors: {
      alias: 'nc',
      description: 'Disable Cross-Origin Resource Sharing',
      type: 'boolean',
    },
  })
  .conflicts('static', 'noStatic') // cannot define static hosting folder and say no-static server
  .help('help', 'h')
  .version(pkg.version)
  .alias('version', 'v')
  .example('$0 db.json', '')
  .require(1, 'Missing the <sourceFile> argument.');

// run server
server({
  filename: argv._[0],
  port: argv.port,
  host: argv.host,
  watch: argv.watch,
  staticPath: argv.static as string,
  noStatic: argv.noStatic || false,
  noCors: argv.noCors || false,
});
