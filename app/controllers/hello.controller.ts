import * as Router from 'koa-router';

class HelloController {

  private Router = new Router({
    prefix: '/hello',
  });

  constructor() {
    console.log('Home Constructor was called');
  }

  public router(): Router {
    return this.Router
      .get('/', this.index);
  }

  private async index(ctx) {
    ctx.body = {
      data: {
        text: 'Hello World',
      },
    };
  }
}

export default new HelloController().router();
