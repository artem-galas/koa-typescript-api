import * as chai from 'chai';
import server from '../../app';
import * as config from 'config';

import * as mongoose from 'mongoose';
import {userData, usersData} from '../fixtures/user.fixture';
import {IUserModel, User} from '../../models/user.model';
import {bookData} from '../fixtures/book.fixture';

export interface ITestController {
  requestUrl: string;
  before(): any;
  after(): any;
}

export class TestController implements ITestController {
  public static app;
  public static before() {
    console.log(`Run test serve on ${config.get('server.port')} port`);
    this.app = server.listen(config.get<number>('server.port'));
    chai.should();
  }

  public static async after() {
    console.log('Stop test server');
    this.app.close();
    await mongoose.connection.db.dropDatabase();
  }

  public requestUrl: string;
  public userData = userData;
  public usersFixtures: Array<IUserModel> = [];
  public bookData = bookData;

  constructor(path: string) {
    this.requestUrl = `${config.get<string>('server.url')}/${path}`;
  }

  public async before() {
    for (const user of usersData) {
      this.usersFixtures.push(await User.create(user));
    }
  }

  public async after() {
    await mongoose.connection.db.dropDatabase();
  }
}
