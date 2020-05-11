import _ from 'lodash';
import fp from 'fastify-plugin';

import { pluralRoute } from './helpers/pluralRoute';
import { singularRoute } from './helpers/singularRoute';

export default fp(async (f, opts, next) => {
  // get data snapshot
  const db: {} = f.lowDb.getState();

  _.each(db, async (value, key) => {
    // define all plural routes
    if (_.isArray(value)) {
      console.log(`${key} is Array: http://${opts.host}:${opts.port}/${key}`);
      return pluralRoute(f, key, opts);
    }

    // singular routes
    if (_.isPlainObject(value)) {
      console.log(`${key} is Object: http://${opts.host}:${opts.port}/${key}`);
      return singularRoute(f, key, opts);
    }
  });

  next();
});
