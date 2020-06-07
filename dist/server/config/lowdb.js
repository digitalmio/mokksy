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
const lowdb_1 = __importDefault(require("lowdb"));
const chalk_1 = __importDefault(require("chalk"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Memory = require('lowdb/adapters/Memory');
exports.default = fastify_plugin_1.default((server, { sourceFile }) => __awaiter(void 0, void 0, void 0, function* () {
    // make sure that the file exists
    if (!fs_1.default.existsSync(sourceFile)) {
        console.log('\n');
        console.log(chalk_1.default.bold.red(`Oops, the database file '${sourceFile}' doesn't exist. Bye!`));
        console.log('\n');
        process.exit(0);
    }
    // TODO: Give users option, maybe they want us to change the data file?
    // For now all changes are in-memory only.
    // load working copy file to memory
    const adapter = new Memory();
    const db = yield lowdb_1.default(adapter);
    // load defaults to our database
    const data = fs_1.default.readFileSync(sourceFile, 'utf-8');
    db.defaults(JSON.parse(data)).write();
    server.decorate('lowDb', db);
}));
