import * as Koa from 'koa';

export class App {

  public koa: Koa;
  constructor() {
    this.koa = new Koa();
  }

}
