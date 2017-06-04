import * as Koa from 'koa';
import {middlewares} from './middelwares/middelwares';
import {Middleware} from 'koa';

class App {

  public app: Koa;
  private handlers: object = {};
  constructor() {
    this.app = new Koa();
    this.middelwares();
  }

  private middelwares() {
    middlewares.forEach((middleware) => this.app.use(this.requireMiddelware(middleware)));
  }

  private requireMiddelware(path): Middleware {
    // if debug is on => will log the middleware travel chain
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL) {
      console.log(`-> setup ${path}`);
      this.app.use(async (next) => {
        await next;
        console.log(`<- setup ${path}`, new Date());
      });
    }

    const handler = require(`./middelwares/${path}`);

    // init is always fast & sync, for tests to run fast
    // boot may be slower and async
    if (handler.init) {
      handler.init(this.app);
    }

    return this.handlers[path] = handler;
  }
}

export default new App().app;
