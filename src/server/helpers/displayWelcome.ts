import chalk from 'chalk';
import type { MokksyConfig } from '../../../types.d';

export default (options: MokksyConfig, availablePort: number) => {
  const chunks = [];
  chunks.push('');
  chunks.push('');
  chunks.push(chalk.cyan('Hello and welcome to MOKKSY!'));
  chunks.push('');
  chunks.push('');

  if (!options.noStatic) {
    chunks.push(chalk.yellow.bold('Homepage'));
    chunks.push(chalk.white(`http://${options.host}:${availablePort}`));
    chunks.push('');
  }

  if (!options.noToken) {
    chunks.push(chalk.yellow.bold('Token Endpoint', chalk.gray('(POST only)')));
    chunks.push(chalk.white(`http://${options.host}:${availablePort}${options.tokenEndpoint}`));
    chunks.push('');
  }

  // actual links will be rendered by /routes/dynamic.ts file
  chunks.push(chalk.yellow.bold('Resources'));

  console.log(chunks.join('\n'));
};
