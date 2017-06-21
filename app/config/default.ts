export default {
  secret: 'secret-api',
  jwtSecret: 'secret-jwt',
  mongoose: {
    uri: 'mongodb://localhost/koa-ts-api',
    options: {
      server: {
        socketOption: {
          keepAlive: 1,
        },
        pollSize: 5,
      },
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    },
  },
  crypto: {
    hash: {
      length: 128,
    },
  },
};
