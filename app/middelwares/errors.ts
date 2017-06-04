import * as Koa from 'koa';

export = async (ctx: Koa.Context, next) => {
  try {
    await next();
  } catch (e) {
    if (e.status) {
      ctx.body = {
        message: e.message,
      };
      ctx.status = e.statusCode || e.status || 500;
      console.log(e.message, e.stack);
    }
  }
};
