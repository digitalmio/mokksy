import Lowdb from 'lowdb';

declare interface AnyObject {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface MokksyConfig {
  filename: string;
  watch?: boolean;
  host: string;
  port: number;
  noCors: boolean;
  noStatic: boolean;
  staticPath?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    lowDb: Lowdb.LowdbSync<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
    blah: number;
  }
}
