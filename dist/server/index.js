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
exports.server = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const assert_1 = __importDefault(require("assert"));
const fastify_1 = __importDefault(require("fastify"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const fastify_favicon_1 = __importDefault(require("fastify-favicon"));
const fastify_static_1 = __importDefault(require("fastify-static"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const split2_1 = __importDefault(require("split2"));
const pump_1 = __importDefault(require("pump"));
const lodash_1 = require("lodash");
const logger_1 = require("./logger");
const lowdb_1 = __importDefault(require("./config/lowdb"));
const generateReqId_1 = require("./helpers/generateReqId");
const portFinder_1 = require("./helpers/portFinder");
const dynamic_1 = __importDefault(require("./routes/dynamic"));
const token_1 = __importDefault(require("./routes/token"));
const routesRedirect_1 = __importDefault(require("./routes/routesRedirect"));
const displayWelcome_1 = __importDefault(require("./helpers/displayWelcome"));
const writeSnapshot_1 = __importDefault(require("./plugins/writeSnapshot"));
const log = split2_1.default(logger_1.logger);
exports.server = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const app = fastify_1.default({
        logger: {
            stream: log,
            serializers: {
                res: (res) => lodash_1.pick(res, ['statusCode', 'url', 'method']),
            },
            customLevels: {
                save: 35,
            },
        },
        genReqId: generateReqId_1.genReqId,
    });
    const { sourceFile, port, staticPath, noStatic, noCors, noToken } = options;
    // find port to run the app, this cannot be done via the FP
    const availablePort = yield portFinder_1.portFinder(port);
    // pretty logs pump to stdout
    pump_1.default(log, process.stdout, assert_1.default.ifError);
    // import LowDB
    app.register(lowdb_1.default, { sourceFile });
    // Always display empty favicon
    // TODO: check if favicon exists if we are hosting static site
    app.register(fastify_favicon_1.default);
    // Disable CORS if, for some strange reason user dont want it. Useful with static hosting
    if (!noCors) {
        app.register(fastify_cors_1.default);
    }
    // register Fastify-JWT to sign and validate JWT Tokens
    if (!noToken) {
        app.register(fastify_jwt_1.default, { secret: options.tokenSecret });
    }
    // Serve static content
    // TODO: move to separate file as plugin
    if (!noStatic && staticPath) {
        const staticFullPath = path_1.default.join(process.cwd(), staticPath);
        // check if folder exists, then register static
        if (fs_1.default.existsSync(staticFullPath)) {
            app.register(fastify_static_1.default, {
                root: staticFullPath,
            });
        }
        else if (staticPath !== 'public') {
            console.log(`Oops, Static content folder '${staticFullPath}' doesn't exist. We won't be serving you static content.`);
        }
    }
    // Hooks:
    // Append short request ID header to every http response
    app.addHook('onSend', (req, reply, payload) => __awaiter(void 0, void 0, void 0, function* () {
        reply.header('request-id', req.id);
        return payload;
    }));
    // hack with "any" - sorry! but I need this info for logger
    // as reply type is hidden quite deep in node type
    app.addHook('onRequest', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.res.url = req.raw.url;
        reply.res.method = req.raw.method;
    }));
    // routes
    const optsWithPort = Object.assign(Object.assign({}, options), { availablePort: availablePort.port });
    app.register(dynamic_1.default, optsWithPort);
    app.register(token_1.default, optsWithPort);
    app.register(routesRedirect_1.default, optsWithPort);
    // add users option to write the database snapshot
    app.register(writeSnapshot_1.default, optsWithPort);
    // export startServer to be able to run it async
    const startServer = (serverPort) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // display all available links in the console before starting server
            displayWelcome_1.default(options, serverPort);
            // ...and go!
            yield app.listen(serverPort, options.host);
        }
        catch (err) {
            app.log.error(err);
            process.exit(1);
        }
    });
    startServer(availablePort.port);
});
