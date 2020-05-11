import njwt from 'njwt';
import fp from 'fastify-plugin';

export default fp(async (f, opts, next) => {
  if (!opts.noToken) {
    f.post(`${opts.tokenEndpoint}`, async (request) => {
      const token = njwt.create(request.body, opts.tokenSecret);
      token.setExpiration(new Date().getTime() + opts.tokenExpiry * 1000);

      return {
        access_token: token.compact(),
        token_type: 'Bearer',
        expires_in: opts.tokenExpiry,
      };
    });
  }

  next();
});
