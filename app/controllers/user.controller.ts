import * as Router from 'koa-router';
import * as Koa from 'koa';
import * as passport from 'koa-passport';

import {IController} from '../libs/controller.interface';
import {RenderCtx} from '../libs/render.class';

import {IUserModel, User} from '../models/user.model';

class UserController implements IController {

  public user: IUserModel;
  private Router = new Router({
    prefix: '/users',
  });
  private renderCtx = new RenderCtx();

  constructor() {}

  // We need use bind for transmission context
  public router(): Router {
    return this.Router
      .param('userName', this.findUser.bind(this))
      .post('/', this.create.bind(this))
      .get('/', this.index.bind(this))
      .get('/:userName', this.show.bind(this))
      .put('/:userName', this.update.bind(this))
      .delete('/:userName', this.destroy.bind(this));
  }

  private async create(ctx: Koa.Context) {
    const user: IUserModel = new User({
      name: ctx.request.body.name,
      username: ctx.request.body.username,
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    await user.save();
    this.renderCtx
      .renderSuccess(
        ctx,
        201,
        'users',
        user.toPlainObject());
  }

  private async index(ctx: Koa.Context) {
    const users: Array<IUserModel> = await User.find({});
    const usersData = users.map((user: IUserModel) => user.toPlainObject());
    this.renderCtx
      .renderSuccess(
        ctx,
        200,
        'users',
        usersData);
  }

  private async show(ctx: Koa.Context, next) {

    await this.checkUser(ctx, next);

    const user: IUserModel = ctx.state.user;
    this.renderCtx
      .renderSuccess(
        ctx,
        200,
        'users',
        user.toPlainObject());
  }

  private async update(ctx: Koa.Context, next) {
    await this.checkUser(ctx, next);
    let user: IUserModel = ctx.state.user;
    await user.update({
      name: ctx.request.body.name,
      email: ctx.request.body.email,
    });
    user = await User.findOne({username: user.username});

    this.renderCtx
      .renderSuccess(
        ctx,
        200,
        'users',
        user.toPlainObject());
  }

  private async destroy(ctx: Koa.Context, next) {
    await this.checkUser(ctx, next);
    const user: IUserModel = ctx.state.user;
    await user.remove();

    this.renderCtx
      .renderSuccess(
        ctx,
        202,
      'user',
      user.toPlainObject());
  }

  private async findUser(username, ctx: Koa.Context, next) {
    this.user = await User.findOne({username: username});

    if (!this.user) {
      return ctx.throw(404);
    }
    return next();
  }

  private async checkUser(ctx: Koa.Context, next) {
    await passport.authenticate('jwt', {session: false})(ctx, next);
    if (!ctx.state.user) {
      ctx.throw(400, 'Invalid Token');
    } else if (!ctx.state.user._id.equals(this.user._id)) {
      ctx.throw(400, 'Invalid Token');
    } else {
      return;
    }
  }
}

export default new UserController().router();
