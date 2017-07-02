import { suite, test, slow, timeout } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as chai from 'chai';

import {Model} from 'mongoose';
import userFixtures from '../fixtures/user.fixture';

import {IUserModel, IUser} from '../../models/user.model';
import server from '../../app';

@suite
class UserControllerTest {

  public static app;

  public static before() {
    this.app = server.listen(3333);
    chai.should();
  }

  public static after() {
    this.app.close();
  }

  private User: Model<IUserModel>;

  @test('POST /users -> should create a new User')
  public async create() {
    const response = await request({
      method: 'POST',
      url: 'http://localhost:3333/users',
      json: true,
      body: userFixtures.user,
      resolveWithFullResponse: true,
    });

    response.statusCode.should.equal(201);
    response.body.success.should.equal(true);
  }
}
