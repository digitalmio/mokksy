"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const fs_1 = __importDefault(require("fs"));
const is_url_1 = __importDefault(require("is-url"));
const lowdb_1 = __importDefault(require("lowdb"));
const chalk_1 = __importDefault(require("chalk"));
const got_1 = __importDefault(require("got"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Memory = require('lowdb/adapters/Memory');
exports.default = fastify_plugin_1.default((server, { sourceFile }) => __awaiter(void 0, void 0, void 0, function* () {
    // load working copy file to memory
    const adapter = new Memory();
    const db = yield lowdb_1.default(adapter);
    // check if sourceFile is URL, if it is, get data and save as defaults
    if (is_url_1.default(sourceFile)) {
        try {
            const body = yield got_1.default.get(sourceFile).json();
            db.defaults(body).write();
        }
        catch (_a) {
            console.log('\n');
            console.log(chalk_1.default.bold.red(`Oops, the data we got from '${sourceFile}' is not JSON. Bye!`));
            console.log('\n');
            process.exit(0);
        }
    }
    // string is not URL, so open it as a file
    else {
        // make sure that the file exists
        if (!fs_1.default.existsSync(sourceFile)) {
            console.log('\n');
            console.log(chalk_1.default.bold.red(`Oops, the database file '${sourceFile}' doesn't exist. Bye!`));
            console.log('\n');
            process.exit(0);
        }
        // load file as defaults to our database
        const data = fs_1.default.readFileSync(sourceFile, 'utf-8');
        db.defaults(JSON.parse(data)).write();
    }
    // decorate 'fastify' object
    server.decorate('lowDb', db);
}));
