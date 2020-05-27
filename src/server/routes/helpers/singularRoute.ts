import { FastifyInstance } from 'fastify';
import pluralize from 'pluralize';
import jwtVerify from './jwtVerify';
import { wait } from '../../helpers/wait';
import type { AnyObject, MokksyConfig } from '../../../../types.d';

export const singularRoute = async (
  f: FastifyInstance,
  key: string,
  options: MokksyConfig
): Promise<void> => {
  // get data from user options
  const { foreignKeySuffix: fks, idKey, apiUrlPrefix: urlPrefix, delay } = options;

  // Get resource
  f.get(`${urlPrefix}/${key}`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // user may want to expand data. Impossible to embed as no IDs
    const { _expand } = request.query;

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // query database
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

  // Put
  f.put(`${urlPrefix}/${key}`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // update database
    const { body: data } = request;
    f.lowDb.set(key, data).write();
    reply.send(data);
  });

  // Patch
  f.patch(`${urlPrefix}/${key}`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // update database
    const currentData = f.lowDb.get(key).value();
    const { body: data } = request;
    f.lowDb.set(key, Object.assign(currentData, data)).write();

    const updatedData = f.lowDb.get(key).value();
    reply.send(updatedData);
  });
};
