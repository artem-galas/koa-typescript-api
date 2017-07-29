import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as chai from 'chai';
import server from '../../app';
import * as config from 'config';

import {Model} from 'mongoose';
import * as mongoose from 'mongoose';
import { userData, usersData } from '../fixtures/user.fixture';

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
    this.app.close();
  }

  private requestUrl: string = `${config.get('server.url')}/auth`;
  private usersFixtures: Array<IUserModel> = [];
  private authUser: IUserModel;
  private userDataIndex: number = 0;

  public async before() {
    for (const user of usersData) {
      this.usersFixtures.push(await User.create(user));
    }
    this.authUser = this.usersFixtures[this.userDataIndex];
  }

  public async after() {
    await mongoose.connection.db.dropDatabase();
  }

  @test('POST /auth/sign-in Valid Data -> should authorize user and return jwt')
  public async signIn() {
    console.log(this.authUser.password);
    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}/sign-in`,
      json: true,
      body: {
        username: this.authUser.username,
        password: usersData[this.userDataIndex].password,
      },
      resolveWithFullResponse: true,
    });

    const responseBodyData = response.body.data;

    response.statusCode.should.equal(200);
    response.body.type.should.equal('auth');
    responseBodyData.name.should.equal(this.authUser.name);
    responseBodyData.should.to.have.keys('token', 'name');
  }

  @test('POST /auth/sign-in Invalid Password -> should return 400 ERROR "Invalid Login Credential"')
  public async signInPasswordError() {
    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}/sign-in`,
      json: true,
      body: {
        username: this.authUser.username,
        password: this.usersFixtures[this.userDataIndex + 1],
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
    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}/sign-in`,
      json: true,
      body: {
        username: this.usersFixtures[this.userDataIndex + 1].username,
        password: usersData[this.userDataIndex].password,
      },
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(400);
    response.body.type.should.equal('error');
    response.body.errors.should.to.have.members(['Invalid Login Credential']);
  }
}
