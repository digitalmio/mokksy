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
const lodash_1 = require("lodash");
const chalk_1 = __importDefault(require("chalk"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = fastify_plugin_1.default((f, opts, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (opts.routes) {
        const chunks = [];
        chunks.push(chalk_1.default.yellow.bold('Route Redirects'));
        const redirects = JSON.parse(fs_1.default.readFileSync(opts.routes, 'utf-8'));
        lodash_1.forEach(redirects, (val, key) => {
            // log
            const subChunks = [];
            subChunks.push(chalk_1.default.white(`http://${opts.host}:${opts.availablePort}${key}`));
            subChunks.push(chalk_1.default.green('->'));
            subChunks.push(chalk_1.default.gray(`http://${opts.host}:${opts.availablePort}${val}`));
            chunks.push(subChunks.join(' '));
            f.get(key, (request, reply) => __awaiter(void 0, void 0, void 0, function* () { return reply.redirect(val); }));
        });
        chunks.push('');
        console.log(chunks.join('\n'));
    }
    next();
}));
