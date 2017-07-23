import * as Koa from 'koa';
import {RenderCtx} from '../libs/render.class';

export = async (ctx: Koa.Context, next) => {
  try {
    await next();
  } catch (e) {
    const errors = new Array();
    if (e.name === 'ValidationError') {
      for (const key in e.errors) {
        if (e.errors.hasOwnProperty(key)) {
          errors.push(e.errors[key].message);
        }
      }
      const renderCtx = new RenderCtx();
      renderCtx.renderFaild(ctx, 400, 'error', errors);
    } else if (e.status) {
      const status = e.statusCode || e.status || 500;
      const renderCtx = new RenderCtx();
      renderCtx.renderFaild(ctx, status, 'error', [e.message]);
    } else {
      ctx.throw(e);
      console.log(e.message, e.stack);
    }
  }
};
