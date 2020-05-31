"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
exports.default = (options, availablePort) => {
    const chunks = [];
    chunks.push('');
    chunks.push('');
    chunks.push(chalk_1.default.cyan('Hello and welcome to MOKKSY!'));
    chunks.push('');
    chunks.push('');
    if (!options.noStatic) {
        chunks.push(chalk_1.default.yellow.bold('Homepage'));
        chunks.push(chalk_1.default.white(`http://${options.host}:${availablePort}`));
        chunks.push('');
    }
    if (!options.noToken) {
        chunks.push(chalk_1.default.yellow.bold('Token Endpoint', chalk_1.default.gray('(POST only)')));
        chunks.push(chalk_1.default.white(`http://${options.host}:${availablePort}${options.tokenEndpoint}`));
        chunks.push('');
    }
    // actual links will be rendered by /routes/dynamic.ts file
    chunks.push(chalk_1.default.yellow.bold('Resources'));
    console.clear();
    console.log(chunks.join('\n'));
};
