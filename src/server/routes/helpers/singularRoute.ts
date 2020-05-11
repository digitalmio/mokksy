import { FastifyInstance } from 'fastify';
import pluralize from 'pluralize';
import type { AnyObject } from '../../../../types.d';

export const singularRoute = async (
  f: FastifyInstance,
  key: string,
  options: AnyObject
): Promise<void> => {
  // get data from user options
  const { foreignKeySuffix: fks, idKey } = options;

  // Get resource
  f.get(`/${key}`, async (request, reply) => {
    // user may want to expand data. Impossible to embed as no IDs
    const { _expand } = request.query;

    const data = f.lowDb.get(key).value();

    if (_expand && !_expand.includes('.')) {
      // check allowed headers
      const isAllowed = Object.keys(data).includes(`${_expand}${fks}`);
      if (isAllowed) {
        const expandData = f.lowDb
          .get(pluralize(_expand))
          .value()
          .find((el: AnyObject) => el[idKey] === data[`${_expand}${fks}`]);

        // eslint-disable-next-line no-underscore-dangle
        data[_expand] = expandData;
      }
    }

    if (data) {
      reply.send(data);
    } else {
      reply.status(404).send({}); // empty response with 404 when item not found
    }
  });

  // Post
  // Put
  // Patch
  // Delete
};
