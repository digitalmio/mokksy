import type { AnyObject } from '../../types.d';

export const objectKeysDeep = (obj: AnyObject): string[] =>
  Object.keys(obj)
    .filter((key) => obj[key] instanceof Object)
    .map((key) => objectKeysDeep(obj[key]).map((k) => `${key}.${k}`))
    .reduce((x, y) => x.concat(y), Object.keys(obj));
