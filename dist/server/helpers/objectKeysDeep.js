"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectKeysDeep = void 0;
exports.objectKeysDeep = (obj) => Object.keys(obj)
    .filter((key) => obj[key] instanceof Object)
    .map((key) => exports.objectKeysDeep(obj[key]).map((k) => `${key}.${k}`))
    .reduce((x, y) => x.concat(y), Object.keys(obj));
