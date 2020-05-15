import fs from 'fs';
import { get, set } from 'lodash';
import type { FastifyRequest } from 'fastify';
import { objectKeysDeep } from '../../helpers/objectKeysDeep';
import type { AnyObject } from '../../../../types.d';

export default (data: AnyObject, templatePath: string, req: FastifyRequest) => {
  // TODO: this is all happy path, make sure it will handle data nicely if user will provide
  // bad data, ie. path to directory
  if (templatePath !== '') {
    const templateFileData = fs.readFileSync(templatePath, 'utf-8');
    if (templateFileData) {
      const template = JSON.parse(templateFileData);

      // template is parsed fine
      if (template) {
        const templateKeys = objectKeysDeep(template);
        return templateKeys.reduce((acc: AnyObject, el: string) => {
          const templateVal = get(template, el);
          let newVal: any;

          switch (templateVal) {
            // data to replace actual key collection
            case '{{data}}':
              newVal = data;
              break;

            // to display number of items in collection
            case '{{total}}':
              newVal = data.length;
              break;

            // current date + time
            case '{{dateTime}}':
              newVal = new Date();
              break;

            // current timestamp
            case '{{timestamp}}':
              newVal = Math.floor(Date.now() / 1000);
              break;

            // echo current URL
            case '{{url}}':
              newVal = req.raw.url;
              break;

            // if not of above, just display template value
            default:
              newVal = templateVal;
              break;
          }

          set(acc, el, newVal);
          return acc;
        }, {});
      }
    }
  }

  // by default, return unprocessed data
  return data;
};
