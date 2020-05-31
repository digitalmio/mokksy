#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const boxen_1 = __importDefault(require("boxen"));
const yargs_run_1 = require("./yargs-run");
// get package file to get version number
const pkg = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires
// default config
const { argv } = yargs_1.default
    .usage('usage: $0 <command>')
    .command(yargs_run_1.runCommandSpec)
    .help('help', 'Show this help page')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .wrap(Math.min(100, yargs_1.default.terminalWidth()));
// if no function selected display more sensible error message and help
if (argv._.length === 0) {
    console.log(boxen_1.default('You need to select command command before moving on.', {
        padding: 1,
        borderColor: 'red',
    }));
    console.log(''); // empty line, leave it
    yargs_1.default.showHelp();
}
