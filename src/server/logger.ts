import padLeft from 'pad-left';
import chalk from 'chalk';
import pMs from 'pretty-ms';
import { isEmpty, isUndefined } from 'lodash';
import type { AnyObject } from '../../types.d';

const nl = '\n';

const incomingMsg = 'incoming request';
const completedMsg = 'request completed';

const emojiLog: AnyObject = {
  10: ' 🔍 ',
  20: ' 🐛 ',
  30: ' ✨ ',
  40: ' ⚠️ ',
  50: ' 🚨 ',
  60: ' 💀 ',
};

const formatDate = (): string => {
  const date = new Date();
  const hours = padLeft(date.getHours().toString(), 2, '0');
  const minutes = padLeft(date.getMinutes().toString(), 2, '0');
  const seconds = padLeft(date.getSeconds().toString(), 2, '0');
  return chalk.gray(`${hours}:${minutes}:${seconds}`);
};

const formatMessage = (data: AnyObject) => {
  if ([incomingMsg, completedMsg].includes(data.msg)) {
    const chunks = [];
    const isIncoming = data.msg === incomingMsg;
    const key = isIncoming ? 'req' : 'res';
    const statusColor = !isIncoming && data.res.statusCode >= 400 ? 'red' : 'cyan';

    chunks.push(chalk.blue('http'));
    chunks.push(chalk.magenta(`Request Id: ${data.reqId}`));
    chunks.push(chalk.green(isIncoming ? '-->' : '<--'));
    chunks.push(chalk[statusColor](data[key].method));
    chunks.push(isIncoming ? chalk.gray('---') : chalk[statusColor](data[key].statusCode));
    chunks.push(chalk.white(data[key].url));

    if (isIncoming === false) {
      chunks.push(chalk.gray(pMs(data.responseTime)));
    }

    return chunks.join(' ');
  }

  return data.level > 40 ? chalk.red(data.msg) : chalk.white(data.msg);
};

export const logger = (inputData: string) => {
  const input = JSON.parse(inputData);

  // do not log if this is "nice text" for route,
  // like "Route GET:/profiledsdds not found"
  if (!isEmpty(input.reqId) && isUndefined(input.req) && isUndefined(input.res)) {
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
