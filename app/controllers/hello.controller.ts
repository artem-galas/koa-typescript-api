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
      .get('/', async (ctx) => {
        ctx.body = {
          data: {
            text: 'World',
          },
        };
      });
  }
}

export default new HelloController().router();
