"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const objectKeysDeep_1 = require("../../helpers/objectKeysDeep");
exports.default = (data, templatePath, req) => {
    // TODO: this is all happy path, make sure it will handle data nicely if user will provide
    // bad data, ie. path to directory
    if (templatePath !== '') {
        const templateFileData = fs_1.default.readFileSync(templatePath, 'utf-8');
        if (templateFileData) {
            const template = JSON.parse(templateFileData);
            // template is parsed fine
            if (template) {
                const templateKeys = objectKeysDeep_1.objectKeysDeep(template);
                return templateKeys.reduce((acc, el) => {
                    const templateVal = lodash_1.get(template, el);
                    let newVal;
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
                    lodash_1.set(acc, el, newVal);
                    return acc;
                }, {});
            }
        }
    }
    // by default, return unprocessed data
    return data;
};
