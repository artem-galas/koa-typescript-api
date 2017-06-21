import * as Router from 'koa-router';

export interface IController {
  router(): Router;
}
