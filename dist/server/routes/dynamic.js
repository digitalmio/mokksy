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
const lodash_1 = require("lodash");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const chalk_1 = __importDefault(require("chalk"));
const pluralRoute_1 = require("./helpers/pluralRoute");
const singularRoute_1 = require("./helpers/singularRoute");
const displayLog = (key, type, opts) => {
    // get list of protected endpoints
    const protectedEndpoints = opts.protectEndpoints.split(',');
    const chunks = [];
    chunks.push(chalk_1.default.white(`http://localhost:${opts.availablePort}${opts.apiUrlPrefix}/${key}`));
    chunks.push(chalk_1.default.green(type));
    if (protectedEndpoints.includes(key)) {
        chunks.push(chalk_1.default.red('(JWT Protected)'));
    }
    console.log(chunks.join(' '));
};
exports.default = fastify_plugin_1.default((f, opts, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get data snapshot
    const db = f.lowDb.getState();
    lodash_1.each(db, (value, key) => __awaiter(void 0, void 0, void 0, function* () {
        // define all plural routes
        if (lodash_1.isArray(value)) {
            // console output
            displayLog(key, 'Collection', opts);
            // parse data
            return pluralRoute_1.pluralRoute(f, key, opts);
        }
        // singular routes
        if (lodash_1.isPlainObject(value)) {
            // console output
            displayLog(key, 'Object', opts);
            // parse data
            return singularRoute_1.singularRoute(f, key, opts);
        }
    }));
    // empty line after listing resources
    console.log('');
    next();
}));
