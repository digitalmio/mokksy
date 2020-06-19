#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import findUp from 'find-up';

import { runCommandSpec } from './yargs-run';

// get package file to get version number
// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.join(__dirname, '../package.json'));

// check if user provided config file
const configPath = findUp.sync(['.mokksyrc', '.mokksyrc.json']);
const config = configPath ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

// start the app
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { argv } = yargs
  .usage('usage: $0 <command>')
  .command(runCommandSpec)
  .help('help', 'Show this help page')
  .alias('help', 'h')
  .version(pkg.version)
  .alias('version', 'v')
  .wrap(Math.min(100, yargs.terminalWidth()))
  .config(config);
