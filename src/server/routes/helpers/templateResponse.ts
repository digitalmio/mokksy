import fs from 'fs';
import { get, set } from 'lodash';
import type { FastifyRequest } from 'fastify';
import { objectKeysDeep } from '../../helpers/objectKeysDeep';
import type { AnyObject } from '../../../../types.d';

export default (data: AnyObject, templatePath: string, req: FastifyRequest) => {
  // TODO: this is all happy path, make sure it will handle data nicely if user will provide
  // bad data, ie. path to directory
  if (templatePath !== '') {
    // TODO: make sure tha path is a file, not directory
    const templateFileData = fs.readFileSync(templatePath, 'utf-8');
    if (templateFileData) {
      const template = JSON.parse(templateFileData);

      // template is parsed fine
      // TODO: what if not?
      if (template) {
        const templateKeys = objectKeysDeep(template);
        return templateKeys.reduce((acc: AnyObject, el: string) => {
          const val = get(template, el);

          // handle "data" - to display user data :)
          if (val === '{{data}}') {
            set(acc, el, data);
          }

          // handle total
          else if (val === '{{total}}') {
            set(acc, el, data.length);
          }

          // handle date time
          else if (val === '{{dateTime}}') {
            set(acc, el, new Date());
          }
          // handle timestamp
          else if (val === '{{timestamp}}') {
            set(acc, el, Math.floor(Date.now() / 1000));
          }
          // handle URL
          else if (val === '{{url}}') {
            set(acc, el, req.raw.url);
          }

          // by default return value
          else {
            set(acc, el, val);
          }

          return acc;
        }, {});
      }
    }
  }

  // by default, return unprocessed data
  return data;
};
