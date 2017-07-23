import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as chai from 'chai';
import server from '../../app';
import * as config from 'config';

import {Model} from 'mongoose';
import * as mongoose from 'mongoose';
import { userFixtures, usersFixtures } from '../fixtures/user.fixture';

import * as jwt from 'jwt-simple';

import {IUserModel, IUser, User} from '../../models/user.model';

/**
 * static before method run BEFORE @suite
 * before method run for EACH @test
 * static after and after the same of before
 */

@suite.only()
class UserControllerTest {

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
  private requestUrl = `${config.get('server.url')}/users`;
  private authUser: IUserModel;
  private token: string;

  public async before() {
    console.log('Authorize user');
    this.authUser = await User.create(userFixtures);
    const payload = {
      id: this.authUser._id,
      name: this.authUser.name,
    };
    this.token = jwt.encode(payload, config.get<string>('jwtSecret'));
    console.log('Create USERS Fixtures');
    for (const user of usersFixtures) {
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
      url: `${this.requestUrl}`,
      json: true,
      body: userFixtures,
      resolveWithFullResponse: true,
    });

    const responseBodyData = {
      name: userFixtures.name,
      username: userFixtures.username,
      email: userFixtures.email,
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
    delete usersFixtures[indexAssert].password;

    response.statusCode.should.equal(200);
    responseBodyData.should.to.be.a('array');
    responseBodyData.length.should.equal(usersFixtures.length);
    responseBodyData[indexAssert].should.to.have.deep.equal(usersFixtures[indexAssert]);
  }

  @test('GET /users/:username -> Should return current user profile')
  public async show() {
    const response = await request({
      method: 'GET',
      headers: {
        authorization: `${this.token}`,
      },
      url: `${this.requestUrl}/${userFixtures.username}`,
      json: true,
      resolveWithFullResponse: true,
    });

    const responseBodyData = this.authUser.toPlainObject();

    response.statusCode.should.equal(200);
    response.body.type.should.equal('users');
    response.body.data.should.to.deep.equal(responseBodyData);
  }

  @test.only('GET /users/:username -> Should return ERROR 400 "Invalid Token"')
  public async showError() {
    // Send different username to url
    const response = await request({
      method: 'GET',
      headers: {
        authorization: `${this.token}`,
      },
      url: `${this.requestUrl}/${usersFixtures[1].username}`,
      json: true,
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(400);
    response.body.type.should.equal('users');
    response.body.errors.should.to.have.members(['Invalid Token']);
  }

}
