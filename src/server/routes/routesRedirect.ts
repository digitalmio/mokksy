import fs from 'fs';
import { forEach } from 'lodash';
import chalk from 'chalk';
import fp from 'fastify-plugin';

export default fp(async (f, opts, next) => {
  if (opts.routes) {
    const chunks = [];
    chunks.push(chalk.yellow.bold('Route Redirects'));

    const redirects = JSON.parse(fs.readFileSync(opts.routes, 'utf-8'));
    forEach(redirects, (val: string, key: string) => {
      // log
      const subChunks = [];
      subChunks.push(chalk.white(`http://${opts.host}:${opts.availablePort}${key}`));
      subChunks.push(chalk.green('->'));
      subChunks.push(chalk.gray(`http://${opts.host}:${opts.availablePort}${val}`));
      chunks.push(subChunks.join(' '));

      f.get(key, async (request, reply) => reply.redirect(val));
    });
    chunks.push('');

    console.log(chunks.join('\n'));
  }

  next();
});
