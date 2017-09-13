import * as Koa from 'koa';
import * as passport from 'koa-passport';
import * as Router from 'koa-router';

import {IController} from '../libs/controller.interface';
import {IBookModel, Book} from '../models/book.model';
import {RenderCtx} from '../libs/render.class';

export class BookController implements IController {

  private Router = new Router({
    prefix: '/books',
  });
  private renderCtx = new RenderCtx();

  public router() {
    return this.Router
      .post('/', this.create.bind(this))
      .get('/', this.index.bind(this));
  }

  private async create(ctx: Koa.Context) {
    const book: IBookModel = new Book({
      name: ctx.request.body.name,
      authors: ctx.request.body.authors,
      price: ctx.request.body.price,
    });
    await book.save();
    this.renderCtx
      .renderSuccess(
        ctx,
        201,
        'books',
        book.toPlainObject());
  }

  private async index(ctx: Koa.Context) {
    const books: Array<IBookModel> = await Book.find({});
    this.renderCtx
      .renderSuccess(
        ctx,
        200,
        'books',
        books);
  }
}

export default new BookController().router();
