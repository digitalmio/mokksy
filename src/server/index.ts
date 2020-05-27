import fs from 'fs';
import path from 'path';
import assert from 'assert';

import type { Server, IncomingMessage, ServerResponse } from 'http';

import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyFavicon from 'fastify-favicon';
import fastifyStatic from 'fastify-static';
import fastifyJwt from 'fastify-jwt';
import split from 'split2';
import pump from 'pump';
import { pick } from 'lodash';
import { logger } from './logger';
import lowDB from './config/lowdb';
import { genReqId } from './helpers/generateReqId';
import { portFinder } from './helpers/portFinder';
import dynamicRoutes from './routes/dynamic';
import tokenRoutes from './routes/token';
import redirectRoutes from './routes/routesRedirect';
import displayWelcome from './helpers/displayWelcome';
import writeSnapshot from './plugins/writeSnapshot';

// local types only
import type { MokksyConfig } from '../../types.d';

const log = split(logger);

export const server = async (options: MokksyConfig): Promise<void> => {
  const app: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger: {
      stream: log,
      serializers: {
        res: (res: any) => pick(res, ['statusCode', 'url', 'method']),
      },
      customLevels: {
        save: 35,
      },
    },
    genReqId,
  });

  const { sourceFile, port, staticPath, noStatic, noCors, noToken } = options;

  // find port to run the app, this cannot be done via the FP
  const availablePort = await portFinder(port);

  // pretty logs pump to stdout
  pump(log, process.stdout, assert.ifError);

  // import LowDB
  app.register(lowDB, { sourceFile });

  // Always display empty favicon
  // TODO: check if favicon exists if we are hosting static site
  app.register(fastifyFavicon);

  // Disable CORS if, for some strange reason user dont want it. Useful with static hosting
  if (!noCors) {
    app.register(fastifyCors);
  }

  // register Fastify-JWT to sign and validate JWT Tokens
  if (!noToken) {
    app.register(fastifyJwt, { secret: options.tokenSecret });
  }

  // Serve static content
  // TODO: move to separate file as plugin
  if (!noStatic && staticPath) {
    const staticFullPath = path.join(process.cwd(), staticPath);

    // check if folder exists, then register static
    if (fs.existsSync(staticFullPath)) {
      app.register(fastifyStatic, {
        root: staticFullPath,
      });
    } else if (staticPath !== 'public') {
      console.log(
        `Oops, Static content folder '${staticFullPath}' doesn't exist. We won't be serving you static content.`
      );
    }
  }

  // Hooks:
  // Append short request ID header to every http response
  app.addHook('onSend', async (req, reply, payload) => {
    reply.header('request-id', req.id);
    return payload;
  });

  // hack with "any" - sorry! but I need this info for logger
  // as reply type is hidden quite deep in node type
  app.addHook('onRequest', async (req, reply: any) => {
    reply.res.url = req.raw.url;
    reply.res.method = req.raw.method;
  });

  // routes
  const optsWithPort = { ...options, availablePort: availablePort.port };
  app.register(dynamicRoutes, optsWithPort);
  app.register(tokenRoutes, optsWithPort);
  app.register(redirectRoutes, optsWithPort);

  // add users option to write the database snapshot
  app.register(writeSnapshot, optsWithPort);

  // export startServer to be able to run it async
  const startServer = async (serverPort: number): Promise<void> => {
    try {
      // display all available links in the console before starting server
      displayWelcome(options, serverPort);

      // ...and go!
      await app.listen(serverPort, options.host);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  startServer(availablePort.port);
};
