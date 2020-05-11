import Lowdb from 'lowdb';

declare interface AnyObject {
  [key: string]: any;
}

interface MokksyConfig {
  sourceFile: string;
  watch?: boolean;
  host: string;
  port: number;
  noCors: boolean;
  noStatic: boolean;
  staticPath?: string;
  idKey: string;
  foreignKeySuffix: string;
  tokenEndpoint: string;
  noToken: boolean;
  tokenSecret: string;
  tokenExpiry: number;
  template?: string;
  apiUrlPrefix: string;
  filtering: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    lowDb: Lowdb.LowdbSync<any[]>;
  }
}
