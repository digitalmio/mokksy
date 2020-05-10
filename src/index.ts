#!/usr/bin/env node

import yargs from 'yargs';
import boxen from 'boxen';

import { runCommandSpec } from './yargs-run';

// get package file to get version number
const pkg = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

// default config
const { argv } = yargs
  .usage('usage: $0 <command>')
  .command(runCommandSpec)
  .help('help', 'Show this help page')
  .alias('help', 'h')
  .version(pkg.version)
  .alias('version', 'v')
  .wrap(Math.min(100, yargs.terminalWidth()));

// if no function selected display more sensible error message and help
if (argv._.length === 0) {
  console.log(
    boxen('You need to select command command before moving on.', {
      padding: 1,
      borderColor: 'red',
    })
  );
  console.log(''); // empty line, leave it
  yargs.showHelp();
}
