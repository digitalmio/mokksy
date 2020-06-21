import chalk from 'chalk';
import internalIp from 'internal-ip';
import type { MokksyConfig } from '../../../types.d';

export default (options: MokksyConfig, availablePort: number) => {
  const chunks = [];
  chunks.push('');
  chunks.push('');
  chunks.push(chalk.cyan('Hello and welcome to MOKKSY!'));
  chunks.push('');
  chunks.push('');

  if (!options.noStatic) {
    chunks.push(chalk.yellow.bold('Root resource / homepage'));
    chunks.push(chalk.white(`http://localhost:${availablePort}`));
    chunks.push(
      // eslint-disable-next-line operator-linebreak
      chalk.white(`http://${internalIp.v4.sync()}:${availablePort}`) +
        chalk.gray(' to share your server in local network*')
    );
    chunks.push(chalk.gray('* this might be blocked by your network admin'));
    chunks.push('');
  }

  chunks.push(chalk.yellow.bold('Database snapshot', chalk.gray('(response might be very big)')));
  chunks.push(chalk.white(`http://localhost:${availablePort}/_db`));
  chunks.push('');

  if (!options.noToken) {
    chunks.push(chalk.yellow.bold('Token Endpoint', chalk.gray('(POST only)')));
    chunks.push(chalk.white(`http://localhost:${availablePort}${options.tokenEndpoint}`));
    chunks.push('');
  }

  // actual links will be rendered by /routes/dynamic.ts file
  chunks.push(chalk.yellow.bold('Resources'));

  console.log(chunks.join('\n'));
};
