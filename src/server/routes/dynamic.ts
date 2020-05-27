import { each, isArray, isPlainObject } from 'lodash';
import fp from 'fastify-plugin';
import chalk from 'chalk';

import { pluralRoute } from './helpers/pluralRoute';
import { singularRoute } from './helpers/singularRoute';

import type { MokksyConfig } from '../../../types.d';

const displayLog = (key: string, type: string, opts: MokksyConfig) => {
  // get list of protected endpoints
  const protectedEndpoints = opts.protectEndpoints.split(',');

  const chunks = [];
  chunks.push(chalk.white(`http://${opts.host}:${opts.availablePort}${opts.apiUrlPrefix}/${key}`));
  chunks.push(chalk.green(type));
  if (protectedEndpoints.includes(key)) {
    chunks.push(chalk.red('(JWT Protected)'));
  }
  console.log(chunks.join(' '));
};

export default fp(async (f, opts, next) => {
  // get data snapshot
  const db: {} = f.lowDb.getState();

  each(db, async (value, key) => {
    // define all plural routes
    if (isArray(value)) {
      // console output
      displayLog(key, 'Collection', opts);

      // parse data
      return pluralRoute(f, key, opts);
    }

    // singular routes
    if (isPlainObject(value)) {
      // console output
      displayLog(key, 'Object', opts);

      // parse data
      return singularRoute(f, key, opts);
    }
  });

  // empty line after listing resources
  console.log('');

  next();
});
