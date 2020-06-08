import fp from 'fastify-plugin';
import fs from 'fs';
import isUrl from 'is-url';
import low from 'lowdb';
import chalk from 'chalk';
import got from 'got';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Memory = require('lowdb/adapters/Memory');

export default fp(async (server, { sourceFile }) => {
  // load working copy file to memory
  const adapter = new Memory();
  const db = await low(adapter);

  // check if sourceFile is URL, if it is, get data and save as defaults
  if (isUrl(sourceFile)) {
    try {
      const body = await got.get(sourceFile).json();
      db.defaults(body).write();
    } catch {
      console.log('\n');
      console.log(chalk.bold.red(`Oops, the data we got from '${sourceFile}' is not JSON. Bye!`));
      console.log('\n');
      process.exit(0);
    }
  }

  // string is not URL, so open it as a file
  else {
    // make sure that the file exists
    if (!fs.existsSync(sourceFile)) {
      console.log('\n');
      console.log(chalk.bold.red(`Oops, the database file '${sourceFile}' doesn't exist. Bye!`));
      console.log('\n');
      process.exit(0);
    }

    // load file as defaults to our database
    const data = fs.readFileSync(sourceFile, 'utf-8');
    db.defaults(JSON.parse(data)).write();
  }

  // decorate 'fastify' object
  server.decorate('lowDb', db);
});
