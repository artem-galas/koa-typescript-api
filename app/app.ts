import * as Koa from 'koa';

process.env.NODE_CONFIG_DIR = './app/config';
import * as config from 'config';

import {Middleware} from 'koa';

import {middlewares} from './middelwares/middelwares';

import MongooseLib from './libs/mongoose';

import UserController from './controllers/user.controller';
import AuthController from './controllers/auth.controller';

class App {

  public app: Koa;
  private handlers: object = {};
  private mongoose;

  constructor() {
    this.mongoose = MongooseLib;
    this.app = new Koa();
    this.middelwares();
    this.routes();
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

  private routes() {
    this.app.use(UserController.routes());
    this.app.use(AuthController.routes());
  }
}

export default new App().app;
