import fs from 'fs';
import chalk from 'chalk';
import fp from 'fastify-plugin';

export default fp(async (f, opts, next) => {
  // inform the users that they can do the snapshots
  const chunk = [];
  chunk.push('\n');
  chunk.push(
    chalk.cyan("You can save database snapshot at any time by pressing 's' and then 'Enter'.")
  );
  chunk.push('\n');
  console.log(chunk.join('\n'));

  // listen to newlines, to save snapshots
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (ch: string) => {
    if (ch.trim().toLowerCase() === 's') {
      const timestamp = +new Date();
      const filename = `mksy-${timestamp}.json`;
      fs.writeFileSync(filename, JSON.stringify(f.lowDb.getState(), null, 2), 'utf-8');
      f.log.save(`Snapshot '${filename}' successfully saved.`);
    }
  });

  next();
});
