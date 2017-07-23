import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as chai from 'chai';
import server from '../../app';
import * as config from 'config';

import {Model} from 'mongoose';
import * as mongoose from 'mongoose';
import { userFixtures, usersFixtures } from '../fixtures/user.fixture';

import {IUserModel, IUser, User} from '../../models/user.model';

@suite
class AuthControllerTest {
  public static app;

  public static before() {
    console.log(`Test Server RUN on ${config.get('server.port')} port`);
    this.app = server.listen(config.get<number>('server.port'));
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

    for (const user of usersFixtures) {
      await User.create(user);
    }
  }

  public async after() {
    console.log('DROP test database');
    await mongoose.connection.db.dropDatabase();
  }

  @test('POST /auth/sign-in Valid Data -> should authorize user and return jwt')
  public async signIn() {
    const authUser = usersFixtures[0];

    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}/auth/sign-in`,
      json: true,
      body: {
        username: authUser.username,
        password: authUser.password,
      },
      resolveWithFullResponse: true,
    });

    const responseBodyData = response.body.data;

    response.statusCode.should.equal(200);
    response.body.type.should.equal('auth');
    responseBodyData.name.should.equal(authUser.name);
    responseBodyData.should.to.have.keys('token', 'name');
  }

  @test('POST /auth/sign-in Invalid Password -> should return 400 ERROR "Invalid Login Credential"')
  public async signInPasswordError() {
    const authUser = usersFixtures[0];

    // Send wrong password
    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}/auth/sign-in`,
      json: true,
      body: {
        username: authUser.username,
        password: '123456789',
      },
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(400);
    response.body.type.should.equal('error');
    response.body.errors.should.to.have.members(['Invalid Login Credential']);
  }

  @test('POST /auth/sign-in Invalid Username -> should return 400 ERROR "Invalid Login Credential"')
  public async signInUsernameError() {
    const authUser = usersFixtures[0];

    // Send wrong username
    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}/auth/sign-in`,
      json: true,
      body: {
        username: usersFixtures[1].username,
        password: usersFixtures[0].password,
      },
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(400);
    response.body.type.should.equal('error');
    response.body.errors.should.to.have.members(['Invalid Login Credential']);
  }
}
