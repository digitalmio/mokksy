"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const internal_ip_1 = __importDefault(require("internal-ip"));
exports.default = (options, availablePort) => {
    const chunks = [];
    chunks.push('');
    chunks.push('');
    chunks.push(chalk_1.default.cyan('Hello and welcome to MOKKSY!'));
    chunks.push('');
    chunks.push('');
    if (!options.noStatic) {
        chunks.push(chalk_1.default.yellow.bold('Root resource / homepage'));
        chunks.push(chalk_1.default.white(`http://localhost:${availablePort}`));
        chunks.push(
        // eslint-disable-next-line operator-linebreak
        chalk_1.default.white(`http://${internal_ip_1.default.v4.sync()}:${availablePort}`) +
            chalk_1.default.gray(' to share your server in local network*'));
        chunks.push(chalk_1.default.gray('* this might be blocked by your network admin'));
        chunks.push('');
    }
    chunks.push(chalk_1.default.yellow.bold('Database snapshot', chalk_1.default.gray('(response might be very big)')));
    chunks.push(chalk_1.default.white(`http://localhost:${availablePort}/_db`));
    chunks.push('');
    if (!options.noToken) {
        chunks.push(chalk_1.default.yellow.bold('Token Endpoint', chalk_1.default.gray('(POST only)')));
        chunks.push(chalk_1.default.white(`http://localhost:${availablePort}${options.tokenEndpoint}`));
        chunks.push('');
    }
    // actual links will be rendered by /routes/dynamic.ts file
    chunks.push(chalk_1.default.yellow.bold('Resources'));
    console.log(chunks.join('\n'));
};
