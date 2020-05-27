import { pick } from 'lodash';
import type { Argv } from 'yargs';
import { server } from './server';
import type { AnyObject, MokksyConfig } from '../types.d';

export const runCommandSpec = {
  command: 'run [options] <sourceFile>',
  aliases: 'start',
  describe: 'run the server',
  builder: (yargs: Argv) =>
    yargs
      .usage('$0 run [options] <sourceFile>')
      .positional('sourceFile', {
        describe: 'JSON database file path',
        type: 'string',
      })
      .options({
        port: {
          alias: 'p',
          description: 'Set port',
          default: 5000,
        },
        host: {
          alias: 'H',
          description: 'Set host',
          default: 'localhost',
        },
        apiUrlPrefix: {
          alias: 'api',
          description: `Prefix the URL path, ie. '/api' for '/api/posts'. Path must start with '/'`,
          type: 'string',
          default: '',
        },
        routes: {
          alias: 'r',
          description:
            'List of custom routes as JSON key:value. On request of the key route you will be redirected to value.',
          type: 'string',
          default: '',
        },
        idKey: {
          alias: 'i',
          description: `Set database 'ID' key (ie. '_id' for Mongo-like collections)`,
          type: 'string',
          default: 'id',
        },
        foreignKeySuffix: {
          alias: 'fks',
          description: `Set foreign key suffix.
                Ie. '_id' for keys like 'user_id', 'post_id', etc.
                Default is 'Id' for keys like 'userId', 'postId', etc.`,
          default: 'Id',
        },
        watch: {
          alias: 'w',
          description: '(WIP) Watch for changes on database file',
          type: 'boolean',
          default: false,
        },
        staticPath: {
          alias: 's',
          description: 'Set static files directory',
          type: 'string',
          default: 'public',
        },
        noStatic: {
          alias: 'ns',
          description: 'Disable static file server',
          type: 'boolean',
          default: false,
        },
        noCors: {
          alias: 'nc',
          description: 'Disable Cross-Origin Resource Sharing',
          type: 'boolean',
          default: false,
        },
        filtering: {
          alias: 'f',
          type: 'string',
          description: `Query params filtering type:
            Inclusive (incl) - when element needs to match all filters.
            Exclusive (excl) - when the element needs to match just one of the filters.`,
          choices: ['incl', 'excl'],
          default: 'incl',
        },
        delay: {
          alias: 'd',
          type: 'number',
          description: 'Add delay to responses (ms)',
          default: 0,
        },
        noToken: {
          alias: 'nt',
          description: 'Disable JWT token endpoint',
          type: 'boolean',
          default: false,
        },
        tokenEndpoint: {
          alias: 'te',
          type: 'string',
          description: 'URL for your app to process JWT token requests',
          default: '/oauth/token',
        },
        tokenSecret: {
          alias: 'ts',
          type: 'string',
          description:
            'Secret used to sign tokens on token endpoint. This password is VERY weak and should be used for testing purpuses only!',
          default: 'MoKKsy',
        },
        tokenExpiry: {
          alias: 'tex',
          type: 'number',
          description: 'Time in seconds for JWT token to expire. 1 hour by default.',
          default: 3600,
        },
        protectEndpoints: {
          alias: 'pe',
          type: 'string',
          description: `Comma separated list of endpoints that needs to be protected by JWT token.
            By default all endpoints are NOT protected.`,
          default: '',
        },
        template: {
          alias: 't',
          type: 'string',
          description: `Template file path to format the response data. No template by default.`,
          default: '',
        },
      })
      .example(
        '$0 run --nc -p 8080 db.json',
        `Run 'db.json' database on port 8080 and disable CORS.`
      ),
  handler: (argv: AnyObject) => {
    // run server
    const confKeys = pick(argv, [
      'sourceFile',
      'port',
      'host',
      'apiUrlPrefix',
      'routes',
      'idKey',
      'foreignKeySuffix',
      'watch',
      'staticPath',
      'noStatic',
      'noCors',
      'filtering',
      'delay',
      'noToken',
      'tokenEndpoint',
      'tokenSecret',
      'tokenExpiry',
      'protectEndpoints',
      'template',
    ]);

    return server(confKeys as MokksyConfig);
  },
};
