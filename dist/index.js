#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yargs_1 = __importDefault(require("yargs"));
const find_up_1 = __importDefault(require("find-up"));
const yargs_run_1 = require("./yargs-run");
// get package file to get version number
// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path_1.default.join(__dirname, '../package.json'));
// check if user provided config file
const configPath = find_up_1.default.sync(['.mokksyrc', '.mokksyrc.json']);
const config = configPath ? JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8')) : {};
// start the app
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { argv } = yargs_1.default
    .usage('usage: $0 <command>')
    .command(yargs_run_1.runCommandSpec)
    .help('help', 'Show this help page')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .wrap(Math.min(100, yargs_1.default.terminalWidth()))
    .config(config);
