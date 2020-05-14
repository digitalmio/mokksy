import fp from 'fastify-plugin';

export default fp(async (f, opts, next) => {
  if (!opts.noToken) {
    f.post(`${opts.tokenEndpoint}`, async (request) => {
      const token = f.jwt.sign(request.body, { expiresIn: opts.tokenExpiry });

      return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: opts.tokenExpiry,
      };
    });
  }

  next();
});
