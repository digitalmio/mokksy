import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ServerResponse } from 'http';

export default async (
  key: string,
  protectedString: string,
  request: FastifyRequest,
  reply: FastifyReply<ServerResponse>
) => {
  // parse list of protected endpoints
  const protectedKeys = protectedString.split(',');

  // validate only if key is on the list
  if (protectedKeys.includes(key)) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }
};
