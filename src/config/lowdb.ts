import fp from 'fastify-plugin';
import fs from 'fs';
import low from 'lowdb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileSync = require('lowdb/adapters/FileSync');

export default fp(async (server, { filename }) => {
  // make sure that the file exists
  if (!fs.existsSync(filename)) {
    console.log(`Oops, the database file '${filename}' doesn't exist. Bye!`);
    process.exit(0);
  }

  // load working copy file
  const adapter = new FileSync(filename);
  const handler = low(adapter);

  server.decorate('lowDb', handler);
});
