import * as Router from 'koa-router';
import * as Koa from 'koa';
import * as passport from 'koa-passport';

import * as jwt from 'jwt-simple';

import * as config from 'config';

import {RenderCtx} from '../libs/render.class';
import {IController} from '../libs/controller.interface';

class AuthController implements IController {

  private Router = new Router({
    prefix: '/auth',
  });
  private renderCtx = new RenderCtx();

  constructor() {}

  public router(): Router {
    return this.Router
      .post('/sign-in', this.signIn.bind(this));
  }

  private async signIn(ctx: Koa.Context, next) {
    await passport.authenticate('local', {session: false})(ctx, next);
    if (ctx.state.user) {
      const payload = {
        id: ctx.state.user._id,
        name: ctx.state.user.name,
      };
      const token = jwt.encode(payload, config.get<string>('jwtSecret'));

      const renderData = {
        token: token,
        name: ctx.state.user.name,
      };

      this.renderCtx.renderSuccess(ctx, 200, 'auth', renderData);
    } else {
      this.renderCtx.renderFaild(ctx, 400, 'error', ['Invalid Login Credential']);
    }
  }
}

export default new AuthController().router();
