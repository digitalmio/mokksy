import { flatten, uniq, pick, orderBy, chunk, keys } from 'lodash';
import { FastifyInstance } from 'fastify';
import pluralize from 'pluralize';
import { PAGINATION_LIMT } from '../../config/consts';
import type { AnyObject } from '../../../types.d';

export const pluralRoute = async (f: FastifyInstance, key: string): Promise<void> => {
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
    const valueKeys: string[] = uniq(flatten(data.map((el: AnyObject) => Object.keys(el))));
    const operators = ['', '_gte', '_lte', '_ne', '_like'];
    const valueKeysOps = valueKeys.reduce((acc: string[], el) => {
      const keyOps = operators.map((o) => el + o);
      return [...acc, ...keyOps];
    }, []);
    const queryDataFiltered = pick(request.query, valueKeysOps);

    console.log({ queryDataFiltered });

    // handle simple filtering, non-ops
    data = data.filter(
      (el: AnyObject) =>
        !Object.keys(queryDataFiltered)
          .map((queryParmKey: string) => {
            // greater than or equal
            if (queryParmKey.endsWith('_gte')) {
              const qp = queryParmKey.slice(0, -4);
              return el[qp] >= queryDataFiltered[queryParmKey];
            }

            // lower than or equal
            if (queryParmKey.endsWith('_lte')) {
              const qp = queryParmKey.slice(0, -4);
              return el[qp] <= queryDataFiltered[queryParmKey];
            }

            // not qual
            if (queryParmKey.endsWith('_ne')) {
              const qp = queryParmKey.slice(0, -3);
              // Double eq as query param is a string, so you would not be able to work with ID's
              // eslint-disable-next-line eqeqeq
              return el[qp] != queryDataFiltered[queryParmKey];
            }

            if (queryParmKey.endsWith('_like')) {
              const qp = queryParmKey.slice(0, -4);
              return el[qp].includes(queryDataFiltered[queryParmKey]);
            }

            // default behaviour - standard comparison
            // double eq as query param is a string, so you would not be able to work with ID's
            // eslint-disable-next-line eqeqeq
            return el[queryParmKey] == queryDataFiltered[queryParmKey];
          })
          .includes(false)
    );

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
      const linkHeader = keys(linkHeaderData).map(
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
    // TODO: extract this to separate module, so it can be used in the single and singular routes
    if (_expand) {
      // check if this item is in the list of allowed headers (we have key for it in object)
      const isAllowed = valueKeysOps.includes(`${_expand}Id`); // TODO: change hardcoded "Id" to param

      if (isAllowed) {
        const expandData = f.lowDb.get(pluralize(_expand)).value() || [];
        data = data.reduce((acc: AnyObject[], el: AnyObject) => {
          // eslint-disable-next-line no-underscore-dangle
          el[_expand] = expandData.find((eEl: AnyObject) => eEl.id === el[`${_expand}Id`]);
          acc.push(el);
          return acc;
        }, []);
      }
    }

    if (_embed) {
      const embedData = f.lowDb.get(_embed).value() || [];
      data = data.reduce((acc: AnyObject[], el: AnyObject) => {
        // eslint-disable-next-line no-underscore-dangle
        el[_embed] = embedData
          ? embedData.filter((eEl: AnyObject) => eEl[`${pluralize.singular(key)}Id`] === el.id)
          : [];
        acc.push(el);
        return acc;
      }, []);
    }

    // return data to user if exists (some filters can go crazy)
    return data || [];
  });

  // Get single resource by Id
  f.get(`/${key}/:id`, async (request, reply) => {
    // const { _embed, _expand } = request.query;
    const data = f.lowDb
      .get(key)
      .value()
      .find((el: AnyObject) => el.id === parseInt(request.params.id, 10));

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
