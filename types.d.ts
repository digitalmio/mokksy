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
  protectEndpoints: string;
  template?: string;
  apiUrlPrefix: string;
  filtering: string;
  delay: number;
  redirect?: string;

  // this can/will be added later, if user port is in use
  availablePort?: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    lowDb: Lowdb.LowdbSync<any[]>;
  }

  interface Logger {
    save(msg: string): void;
  }
}
