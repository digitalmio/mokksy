import { flatten, uniq, pick, orderBy, chunk, get } from 'lodash';
import { FastifyInstance } from 'fastify';
import pluralize from 'pluralize';
import { objectKeysDeep } from '../../helpers/objectKeysDeep';
import { PAGINATION_LIMT } from '../../config/consts';
import type { AnyObject } from '../../../../types.d';

export const pluralRoute = async (
  f: FastifyInstance,
  key: string,
  options: AnyObject
): Promise<void> => {
  // get data from user options
  const { filtering, foreignKeySuffix: fks, idKey } = options;

  // Get all resources
  f.get(`/${key}`, async (request, reply) => {
    // defined allowed query params deconstruct
    const { _start, _end, _page, _sort, _order, _limit, _embed, _expand } = request.query;
    const { hostname } = request;

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
          `<http://${hostname}/${key}?_page=${linkHeaderData[el]}&_limit=${limit}>; rel="${el}"` // eslint-disable-line
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
            (exEl: AnyObject) => el[idKey] === exEl[`${_expand}${fks}`]
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
    return data || [];
  });

  // Get single resource by Id
  f.get(`/${key}/:id`, async (request, reply) => {
    // user may want to expand or embed like in the listing, but it is simpler here
    const { _expand, _embed } = request.query;
    const paramId = parseInt(request.params.id, 10);

    const data = f.lowDb
      .get(key)
      .value()
      .find((el: AnyObject) => el[idKey] === paramId);

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

    if (_embed && !_embed.includes('.')) {
      const emKey = `${pluralize.singular(key)}${fks}`;
      const embedData = f.lowDb
        .get(_embed)
        .value()
        .filter((emEl: AnyObject) => emEl[emKey] === data[idKey]);

      // eslint-disable-next-line no-underscore-dangle
      data[_expand] = embedData;
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
