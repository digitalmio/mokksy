#!/usr/bin/env node

import yargs from 'yargs';

import { runCommandSpec } from './yargs-run';

// get package file to get version number
const pkg = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

// default config
// eslint-disable-next-line
const { argv } = yargs
  .usage('usage: $0 <command>')
  .command(runCommandSpec)
  .help('help', 'Show this help page')
  .alias('help', 'h')
  .version(pkg.version)
  .alias('version', 'v')
  .wrap(Math.min(100, yargs.terminalWidth()));
