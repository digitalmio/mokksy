import { flatten, uniq, pick, orderBy, chunk, get } from 'lodash';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pluralize from 'pluralize';
import { nanoid } from 'nanoid';
import type { ServerResponse } from 'http';
import { objectKeysDeep } from '../../helpers/objectKeysDeep';
import templateResponse from './templateResponse';
import jwtVerify from './jwtVerify';
import { PAGINATION_LIMT } from '../../config/consts';
import { wait } from '../../helpers/wait';
import type { AnyObject, MokksyConfig } from '../../../../types.d';

export const pluralRoute = async (
  f: FastifyInstance,
  key: string,
  options: MokksyConfig
): Promise<void> => {
  // get data from user options
  const {
    filtering,
    foreignKeySuffix: fks,
    idKey,
    template,
    apiUrlPrefix: urlPrefix,
    delay,
  } = options;

  // -----------------------------------------------------------------------------------------------
  // - Get all resources
  // -----------------------------------------------------------------------------------------------
  f.get(`${urlPrefix}/${key}`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // defined allowed query params deconstruct
    const { _start, _end, _page, _sort, _order, _limit, _embed, _expand } = request.query;
    const { hostname } = request;

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // get data from the database
    let data = f.lowDb.get(key).value();

    // allow query by field names available in the set
    // each object in collection can have different keys
    // get all keys from every collection object, then flatten them and de-dupe
    const valueKeys: string[] = uniq(flatten(data.map((el: AnyObject) => objectKeysDeep(el))));
    const operators = ['', '_gte', '_lte', '_ne', '_like'];
    const valueKeysOps = valueKeys.reduce((acc: string[], el) => {
      const keyOps = operators.map((o) => el + o);
      return [...acc, ...keyOps];
    }, []);
    const queryDataFiltered = pick(request.query, valueKeysOps);

    // handle filtering
    if (Object.keys(queryDataFiltered).length > 0) {
      data = data.filter((el: AnyObject) => {
        const filtered: boolean[] = Object.keys(queryDataFiltered).map((queryParmKey: string) => {
          // greater than or equal
          if (queryParmKey.endsWith('_gte')) {
            const qp = queryParmKey.slice(0, -4);
            return get(el, qp) >= queryDataFiltered[queryParmKey];
          }

          // lower than or equal
          if (queryParmKey.endsWith('_lte')) {
            const qp = queryParmKey.slice(0, -4);
            return get(el, qp) <= queryDataFiltered[queryParmKey];
          }

          // not qual
          if (queryParmKey.endsWith('_ne')) {
            const qp = queryParmKey.slice(0, -3);
            // Double eq as query param is a string, so you would not be able to work with ID's
            // and unfortunately we do not have a list of the non-string keys.
            // eslint-disable-next-line eqeqeq
            return get(el, qp) != queryDataFiltered[queryParmKey];
          }

          if (queryParmKey.endsWith('_like')) {
            const qp = queryParmKey.slice(0, -5);
            return get(el, qp).includes(queryDataFiltered[queryParmKey]);
          }

          // Default behaviour - standard comparison
          // Double eq as query param is a string, so you would not be able to work with ID's
          // and unfortunately we do not have a list of the non-string keys.
          // eslint-disable-next-line eqeqeq
          return get(el, queryParmKey) == queryDataFiltered[queryParmKey];
        });

        // incl: all elements inside array are true (aka, no false)
        // excl: at least one true element
        return filtering === 'incl' ? !filtered.includes(false) : filtered.includes(true);
      });
    }

    // handle sort: _sort, _order
    if (_sort) {
      const sortArr = _sort.split(',');
      const orderArr = _order
        ? _order.split(',').map((el: string) => el.toLowerCase())
        : new Array(_sort.lenth).map(() => 'asc');
      data = orderBy(data, sortArr, orderArr);
    }

    // handle pagination: _page, _limit
    if (_page) {
      const page = parseInt(_page, 10) || 1;
      const limit = parseInt(_limit, 10) || PAGINATION_LIMT;

      // group in chunks as asked by user
      const groupedData = chunk(data, limit);

      // Add 'link' header
      const linkHeaderData: AnyObject = {
        first: 1,
        prev: page - 1 < 1 ? 1 : page - 1,
        next: page + 1 > groupedData.length ? groupedData.length : page + 1,
        last: groupedData.length,
      };
      const linkHeader = Object.keys(linkHeaderData).map(
        (el) =>
          `<http://${hostname}/${key}?_page=${linkHeaderData[el]}&_limit=${limit}>; rel="${el}"`
      );
      reply.header('Link', linkHeader.join(', '));

      // define data to return
      data = groupedData[page - 1];
    }

    // hadle slicing: _start, _end, _limit
    if (_start && (_end || _limit)) {
      const start = parseInt(_start, 10) || 1;
      const limit = parseInt(_limit, 10) || PAGINATION_LIMT;
      const end = parseInt(_end, 10) || start + limit;

      // Add 'x-total-count' header
      reply.header('x-total-count', data.length);

      // slice the data
      data = data.slice(start, end);
    }

    // handle more data: _expand, _embed
    // You can only embed top level resource, so
    if (_expand && !_expand.includes('.')) {
      // check if this item is in the list of allowed headers (we have key for it in object)
      const isAllowed = valueKeysOps.includes(`${_expand}${fks}`);

      if (isAllowed) {
        const expandData = f.lowDb.get(pluralize(_expand)).value() || [];
        data = data.map((el: AnyObject) => {
          // eslint-disable-next-line no-underscore-dangle
          el[_expand] = expandData.find(
            (exEl: AnyObject) => el[`${_expand}${fks}`] === exEl[idKey]
          );
          return el;
        });
      }
    }

    if (_embed && !_embed.includes('.')) {
      const embedData = f.lowDb.get(_embed).value() || [];
      const emKey = `${pluralize.singular(key)}${fks}`;
      data = data.map((el: AnyObject) => {
        // eslint-disable-next-line no-underscore-dangle
        el[_embed] = embedData.filter((emEl: AnyObject) => emEl[emKey] === el[idKey]);
        return el;
      });
    }

    // return data to user if exists (some filters can go crazy)
    const returnData = data || [];
    return template ? templateResponse(returnData, template, request) : returnData;
  });

  // -----------------------------------------------------------------------------------------------
  // - Get single resource by Id
  // -----------------------------------------------------------------------------------------------
  f.get(`${urlPrefix}/${key}/:id`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // user may want to expand or embed like in the listing, but it is simpler here
    const { _expand, _embed } = request.query;
    const paramId = request.params.id;

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    const data = f.lowDb
      .get(key)
      // user can use whatever he like for param id, fastify is treating params as strings
      // eslint-disable-next-line eqeqeq
      .find((el: AnyObject) => el[idKey] == paramId)
      .value();

    if (_expand && !_expand.includes('.')) {
      // check allowed headers
      const isAllowed = Object.keys(data).includes(`${_expand}${fks}`);
      if (isAllowed) {
        const expandData = f.lowDb
          .get(pluralize(_expand))
          .find((el: AnyObject) => el[idKey] === data[`${_expand}${fks}`])
          .value();

        // eslint-disable-next-line no-underscore-dangle
        data[_expand] = expandData;
      }
    }

    if (_embed && !_embed.includes('.')) {
      const emKey = `${pluralize.singular(key)}${fks}`;
      const embedData = f.lowDb
        .get(_embed)
        .filter((emEl: AnyObject) => emEl[emKey] === data[idKey])
        .value();

      // eslint-disable-next-line no-underscore-dangle
      data[_expand] = embedData;
    }

    if (data) {
      reply.send(data);
    } else {
      reply.status(404).send({}); // empty response with 404 when item not found
    }
  });

  // -----------------------------------------------------------------------------------------------
  // - Post, create new resource
  // -----------------------------------------------------------------------------------------------
  f.post(`${urlPrefix}/${key}`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // get user post data
    const { body: data } = request;

    // Check if no ID and create one using NanoID
    if (!data[idKey]) {
      data[idKey] = nanoid();
    }

    // save new element to database
    f.lowDb.get(key).push(data).write();
    reply.status(201).send(data);
  });

  // -----------------------------------------------------------------------------------------------
  // Put + Patch - update current resource
  // -----------------------------------------------------------------------------------------------
  const update = async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // delay the response
    await wait(delay);

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // update database
    const { body: data } = request;
    const paramId = request.params.id;
    const reqMethod = request.raw.method || 'PUT';

    const dbTable = f.lowDb.get(key);

    // get current data
    // eslint-disable-next-line eqeqeq
    const currentData = dbTable.find((el: AnyObject) => el[idKey] == paramId);
    const currentDataValues = currentData.value();

    // Prepare values for 'PUT' method prepare clean object, delete old keys
    const oldKeys = Object.keys(currentDataValues);
    const emptyOb = oldKeys.reduce((acc: AnyObject, el: string) => {
      acc[el] = undefined;
      return acc;
    }, {});
    const newValuesPut = {
      ...emptyOb,
      [idKey]: currentDataValues[idKey],
      ...data,
    };

    const result = currentData.assign(reqMethod === 'PUT' ? newValuesPut : data).write();

    reply.send(result);
  };

  f.put(`${urlPrefix}/${key}/:id`, update);
  f.patch(`${urlPrefix}/${key}/:id`, update);

  // -----------------------------------------------------------------------------------------------
  // - Delete resource
  // -----------------------------------------------------------------------------------------------
  f.delete(`${urlPrefix}/${key}/:id`, async (request, reply) => {
    // delay the response
    await wait(delay);

    // Param from the URL
    const paramId = request.params.id;

    // JWT check if route is protected
    await jwtVerify(key, options.protectEndpoints, request, reply);

    // save new element to database
    f.lowDb
      .get(key)
      // eslint-disable-next-line eqeqeq
      .remove((el: AnyObject) => el[idKey] == paramId)
      .write();

    reply.send({});
  });
};
