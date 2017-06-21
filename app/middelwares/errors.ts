import * as Koa from 'koa';

export = async (ctx: Koa.Context, next) => {
  try {
    await next();
  } catch (e) {
    const errors = new Array();
    if (e.status) {
      if (e.name === 'ValidationError') {
        for (const key in e.errors) {
          if (e.errors.hasOwnProperty(key)) {
            errors.push(e.errors[key].message);
          }
        }
        ctx.body = {
          success: false,
          errors: errors,
        };
      }
      ctx.status = e.statusCode || e.status || 500;
      console.log(e.message, e.stack);
    } else {
      ctx.throw(e);
      console.log(e.message, e.stack);
    }
  }
};
