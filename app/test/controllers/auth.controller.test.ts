import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';

import {Model} from 'mongoose';
import { usersData } from '../fixtures/user.fixture';

import {IUserModel} from '../../models/user.model';
import {TestController} from '../test.helper';

@suite('Auth Controller')
class AuthControllerTest extends TestController {
  private authUser: IUserModel;
  private userDataIndex: number = 0;
  private password = usersData[this.userDataIndex].password;

  constructor() {
    super('auth');
  }

  public async before() {
    await super.before();
    this.authUser = this.usersFixtures[this.userDataIndex];
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
        password: this.password,
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
        password: usersData[this.userDataIndex + 1].password,
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
        password: this.password,
      },
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(400);
    response.body.type.should.equal('error');
    response.body.errors.should.to.have.members(['Invalid Login Credential']);
  }
}
