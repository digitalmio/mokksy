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
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = fastify_plugin_1.default((f, opts, next) => __awaiter(void 0, void 0, void 0, function* () {
    // inform the users that they can do the snapshots
    const chunk = [];
    chunk.push('\n');
    chunk.push(chalk_1.default.cyan("You can save database snapshot at any time by pressing 's' and then 'Enter'."));
    chunk.push('\n');
    console.log(chunk.join('\n'));
    // listen to newlines, to save snapshots
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (ch) => {
        if (ch.trim().toLowerCase() === 's') {
            const timestamp = +new Date();
            const filename = `mksy-${timestamp}.json`;
            fs_1.default.writeFileSync(filename, JSON.stringify(f.lowDb.getState(), null, 2), 'utf-8');
            f.log.save(`Snapshot '${filename}' successfully saved.`);
        }
    });
    next();
}));
