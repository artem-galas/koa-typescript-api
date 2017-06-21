import * as Koa from 'koa';

export class RenderCtx {
  constructor() {}

  public renderSuccess(ctx: Koa.Context, status: number, type: string, data: any) {
    ctx.status = status;

    ctx.body = {
      success: true,
      type: type,
      data: data,
    };
  }

  public renderFaild(ctx: Koa.Context, status: number, type: string, errors: any) {
    ctx.status = status;
    ctx.body = {
      success: false,
      type: type,
      errors: errors,
    };
  }
}
