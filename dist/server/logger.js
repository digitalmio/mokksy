"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pad_left_1 = __importDefault(require("pad-left"));
const chalk_1 = __importDefault(require("chalk"));
const pretty_ms_1 = __importDefault(require("pretty-ms"));
const lodash_1 = require("lodash");
const nl = '\n';
const incomingMsg = 'incoming request';
const completedMsg = 'request completed';
const emojiLog = {
    10: ' 🔍 ',
    20: ' 🐛 ',
    30: ' ✨ ',
    40: ' ⚠️ ',
    50: ' 🚨 ',
    60: ' 💀 ',
    // custom
    35: ' 💾 ',
};
const formatDate = () => {
    const date = new Date();
    const hours = pad_left_1.default(date.getHours().toString(), 2, '0');
    const minutes = pad_left_1.default(date.getMinutes().toString(), 2, '0');
    const seconds = pad_left_1.default(date.getSeconds().toString(), 2, '0');
    return chalk_1.default.gray(`${hours}:${minutes}:${seconds}`);
};
const formatMessage = (data) => {
    if ([incomingMsg, completedMsg].includes(data.msg)) {
        const chunks = [];
        const isIncoming = data.msg === incomingMsg;
        const key = isIncoming ? 'req' : 'res';
        const statusColor = !isIncoming && data.res.statusCode >= 400 ? 'red' : 'cyan';
        chunks.push(chalk_1.default.blue('http'));
        chunks.push(chalk_1.default.magenta(`Request Id: ${data.reqId}`));
        chunks.push(chalk_1.default.green(isIncoming ? '-->' : '<--'));
        chunks.push(chalk_1.default[statusColor](data[key].method));
        chunks.push(isIncoming ? chalk_1.default.gray('---') : chalk_1.default[statusColor](data[key].statusCode));
        chunks.push(chalk_1.default.white(data[key].url));
        if (isIncoming === false) {
            chunks.push(chalk_1.default.gray(pretty_ms_1.default(data.responseTime)));
        }
        return chunks.join(' ');
    }
    return data.level > 40 ? chalk_1.default.red(data.msg) : chalk_1.default.white(data.msg);
};
exports.logger = (inputData) => {
    const input = JSON.parse(inputData);
    // do not log if this is "nice text" for route,
    // like "Route GET:/profiledsdds not found"
    if (!lodash_1.isEmpty(input.reqId) && lodash_1.isUndefined(input.req) && lodash_1.isUndefined(input.res)) {
        return;
    }
    // empty array for data log
    const chunks = [];
    // Format Date
    chunks.push(formatDate());
    // Emoji
    chunks.push(emojiLog[input.level]);
    // Message
    chunks.push(formatMessage(input));
    return chunks.join(' ') + nl;
};
