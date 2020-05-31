"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singularRoute = void 0;
const pluralize_1 = __importDefault(require("pluralize"));
const jwtVerify_1 = __importDefault(require("./jwtVerify"));
const wait_1 = require("../../helpers/wait");
exports.singularRoute = (f, key, options) => __awaiter(void 0, void 0, void 0, function* () {
    // get data from user options
    const { foreignKeySuffix: fks, idKey, apiUrlPrefix: urlPrefix, delay } = options;
    // Get resource
    f.get(`${urlPrefix}/${key}`, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        // delay the response
        yield wait_1.wait(delay);
        // user may want to expand data. Impossible to embed as no IDs
        const { _expand } = request.query;
        // JWT check if route is protected
        yield jwtVerify_1.default(key, options.protectEndpoints, request, reply);
        // query database
        const data = f.lowDb.get(key).value();
        if (_expand && !_expand.includes('.')) {
            // check allowed headers
            const isAllowed = Object.keys(data).includes(`${_expand}${fks}`);
            if (isAllowed) {
                const expandData = f.lowDb
                    .get(pluralize_1.default(_expand))
                    .value()
                    .find((el) => el[idKey] === data[`${_expand}${fks}`]);
                // eslint-disable-next-line no-underscore-dangle
                data[_expand] = expandData;
            }
        }
        if (data) {
            reply.send(data);
        }
        else {
            reply.status(404).send({}); // empty response with 404 when item not found
        }
    }));
    // Put
    f.put(`${urlPrefix}/${key}`, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        // delay the response
        yield wait_1.wait(delay);
        // JWT check if route is protected
        yield jwtVerify_1.default(key, options.protectEndpoints, request, reply);
        // update database
        const { body: data } = request;
        f.lowDb.set(key, data).write();
        reply.send(data);
    }));
    // Patch
    f.patch(`${urlPrefix}/${key}`, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        // delay the response
        yield wait_1.wait(delay);
        // JWT check if route is protected
        yield jwtVerify_1.default(key, options.protectEndpoints, request, reply);
        // update database
        const currentData = f.lowDb.get(key).value();
        const { body: data } = request;
        f.lowDb.set(key, Object.assign(currentData, data)).write();
        const updatedData = f.lowDb.get(key).value();
        reply.send(updatedData);
    }));
});
