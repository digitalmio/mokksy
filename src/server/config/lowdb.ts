import fp from 'fastify-plugin';
import fs from 'fs';
import low from 'lowdb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Memory = require('lowdb/adapters/Memory');

export default fp(async (server, { sourceFile }) => {
  // make sure that the file exists
  if (!fs.existsSync(sourceFile)) {
    console.log(`Oops, the database file '${sourceFile}' doesn't exist. Bye!`);
    process.exit(0);
  }

  // TODO: Give users option, maybe they want us to change the data file?
  // For now all changes are in-memory only.

  // load working copy file to memory
  const adapter = new Memory();
  const db = await low(adapter);
  const data = fs.readFileSync(sourceFile, 'utf-8');
  db.defaults(JSON.parse(data)).write();

  server.decorate('lowDb', db);
});
