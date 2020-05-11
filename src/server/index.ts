import fs from 'fs';
import path from 'path';

import type { Server, IncomingMessage, ServerResponse } from 'http';

import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyFavicon from 'fastify-favicon';
import fastifyStatic from 'fastify-static';
import lowDB from './config/lowdb';
import { genReqId } from './helpers/generateReqId';
import { portFinder } from './helpers/portFinder';
import dynamicRoutes from './routes/dynamic';
import tokenRoutes from './routes/token';

// local types only
import type { MokksyConfig } from '../../types.d';

export const server = async (options: MokksyConfig): Promise<void> => {
  const app: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger: {
      prettyPrint: true,
    },
    genReqId,
  });

  const { sourceFile, port, staticPath, noStatic, noCors } = options;

  // find port to run the app, this cannot be done via the FP
  const availablePort = await portFinder(port);

  // import LowDB
  app.register(lowDB, { sourceFile });

  // Always display empty favicon
  // TODO: check if favicon exists if we are hosting static site
  app.register(fastifyFavicon);

  // Disable CORS if, for some strange reason user dont want it. Useful with static hosting
  if (!noCors) {
    app.register(fastifyCors);
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

  // Hooks: apppend short request ID header to every http response
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('request-id', request.id);
    return payload;
  });

  // routes
  app.register(dynamicRoutes, options);
  app.register(tokenRoutes, options);

  // export startServer to be able to run it async
  const startServer = async (serverPort: number): Promise<void> => {
    try {
      await app.listen(serverPort, options.host);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  // listen to newlines, to save snapshots
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    if (chunk.trim().toLowerCase() === 's') {
      console.log(`Pressed 's'. Cool. Let's save some data.`);
    }
  });

  startServer(availablePort.port);
};
