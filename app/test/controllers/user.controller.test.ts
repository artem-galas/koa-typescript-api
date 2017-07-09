import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as chai from 'chai';
import server from '../../app';
import * as config from 'config';

import {Model} from 'mongoose';
import * as mongoose from 'mongoose';
import { userFixtures, usersFixtures } from '../fixtures/user.fixture';

import {IUserModel, IUser, User} from '../../models/user.model';

/**
 * static before method run BEFORE @suite
 * before method run for EACH @test
 * static after and after the same of before
 */

@suite
class UserControllerTest {

  public static app;

  public static before() {
    console.log(`Test Server RUN on ${3333} port`);
    this.app = server.listen(3333);
    chai.should();
  }

  public static async after() {
    console.log('Test Server CLOSE');
    this.app.close();
  }

  private User: Model<IUserModel>;
  private requestUrl = config.get('server.url');

  public async before() {
    console.log('Create USERS Fixtures');

    for (const user of usersFixtures.users) {
      await User.create(user);
    }
  }

  public async after() {
    console.log('DROP test database');
    await mongoose.connection.db.dropDatabase();
  }

  @test('POST /users -> should create a new User')
  public async create() {
    const response = await request({
      method: 'POST',
      url: 'http://localhost:3333/users',
      json: true,
      body: userFixtures.user,
      resolveWithFullResponse: true,
    });

    const responseBodyData = {
      name: userFixtures.user.name,
      username: userFixtures.user.username,
      email: userFixtures.user.email,
    };

    response.statusCode.should.equal(201);
    response.body.type.should.equal('users');
    response.body.data.should.to.deep.equal(responseBodyData);
  }

  @test('GET /users -> should return Array of Users')
  public async index() {
    const response = await request({
      method: 'GET',
      url: `${this.requestUrl}/users`,
      json: true,
      resolveWithFullResponse: true,
    });

    const responseBodyData = response.body.data;
    const indexAssert = 0;

    // Remove unused property
    delete usersFixtures.users[indexAssert].password;

    response.statusCode.should.equal(200);
    responseBodyData.should.to.be.a('array');
    responseBodyData.length.should.equal(usersFixtures.users.length);
    responseBodyData[indexAssert].should.to.have.deep.equal(usersFixtures.users[indexAssert]);
  }
}
