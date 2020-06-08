import fp from 'fastify-plugin';

export default fp(async (f) => {
  f.get(`/_db`, async () => f.lowDb.getState());
});
