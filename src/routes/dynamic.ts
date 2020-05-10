import _ from 'lodash';
import fp from 'fastify-plugin';

import { pluralRoute } from './helpers/pluralRoute';

export default fp(async (f, opts, next) => {
  const db: {} = f.lowDb.getState();

  _.each(db, async (value, key) => {
    // define all plural routes
    if (_.isArray(value)) {
      console.log(`${key} is Array`);
      return pluralRoute(f, key, opts);
    }

    // singular routes
    if (_.isPlainObject(value)) {
      console.log(`${key} is object`);
    }
  });

  next();
});
