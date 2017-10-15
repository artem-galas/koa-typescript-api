import * as chai from 'chai';
import server from '../app';
import * as config from 'config';

import * as mongoose from 'mongoose';
import {userData, usersData} from './fixtures/user.fixture';
import {IUserModel, User} from '../models/user.model';
import {bookData, booksData} from './fixtures/book.fixture';
import {Book, IBookModel} from '../models/book.model';

export interface ITestController {
  requestUrl: string;
  before(): any;
  after(): any;
}

/**
 * static before method run BEFORE @suite
 * before method run for EACH @test
 */

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
  public booksFixtures: Array<IBookModel> = [];

  constructor(path: string) {
    this.requestUrl = `${config.get<string>('server.url')}/${path}`;
  }

  public async before() {
    for (const user of usersData) {
      this.usersFixtures.push(await User.create(user));
    }
    for (const book of booksData) {
      this.booksFixtures.push(await Book.create(book));
    }
  }

  public async after() {
    await mongoose.connection.db.dropDatabase();
  }
}
