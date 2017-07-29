import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as chai from 'chai';
import server from '../../app';
import * as config from 'config';

import {Model} from 'mongoose';
import * as mongoose from 'mongoose';
import {userData, usersData} from '../fixtures/user.fixture';

import * as jwt from 'jwt-simple';

import {IUser, IUserModel, User} from '../../models/user.model';

/**
 * static before method run BEFORE @suite
 * before method run for EACH @test
 */

@suite('User Controller without Authorize')
class UserControllerOutAuth {

  public static app;

  public static before() {
    console.log(`Test Server RUN on ${config.get('server.port')} port`);
    this.app = server.listen(config.get<number>('server.port'));
    chai.should();
  }

  public static async after() {
    this.app.close();
    await mongoose.connection.db.dropDatabase();
  }

  private User: Model<IUserModel>;
  private requestUrl = `${config.get('server.url')}/users`;
  private userData = userData;
  private usersFixtures: Array<IUserModel> = [];

  public async before() {
    for (const user of usersData) {
      this.usersFixtures.push(await User.create(user));
    }
  }

  public async after() {
    await mongoose.connection.db.dropDatabase();
  }

  @test('POST /users -> should create a new User')
  public async create() {
    const response = await request({
      method: 'POST',
      url: `${this.requestUrl}`,
      json: true,
      body: this.userData,
      resolveWithFullResponse: true,
    });

    const responseBodyData = {
      name: this.userData.name,
      username: this.userData.username,
      email: this.userData.email,
    };

    response.statusCode.should.equal(201);
    response.body.type.should.equal('users');
    response.body.data.should.to.deep.equal(responseBodyData);
  }

  @test('GET /users -> should return Array of Users')
  public async index() {
    const response = await request({
      method: 'GET',
      url: `${this.requestUrl}`,
      json: true,
      resolveWithFullResponse: true,
    });

    const responseBodyData = response.body.data;
    const indexAssert = 0;

    response.statusCode.should.equal(200);
    responseBodyData.should.to.be.a('array');
    responseBodyData.length.should.equal(this.usersFixtures.length);
    responseBodyData[indexAssert].should.to.have.deep.equal(this.usersFixtures[indexAssert].toPlainObject());
  }
}

@suite('User Controller with Authorize')
class UserControllerWithAuth {
  public static app;

  public static before() {
    console.log(`Test Server RUN on ${config.get('server.port')} port`);
    this.app = server.listen(config.get<number>('server.port'));
    chai.should();
  }

  public static async after() {
    this.app.close();
    await mongoose.connection.db.dropDatabase();
  }

  private User: Model<IUserModel>;
  private requestUrl = `${config.get('server.url')}/users`;
  private authUser: IUserModel;
  private token: string;
  private usersFixtures: Array<IUserModel> = [];

  public async before() {
    this.authUser = await User.create(userData);
    const payload = {
      id: this.authUser._id,
      name: this.authUser.name,
    };
    this.token = jwt.encode(payload, config.get<string>('jwtSecret'));

    for (const user of usersData) {
      this.usersFixtures.push(await User.create(user));
    }
  }

  public async after() {
    await mongoose.connection.db.dropDatabase();
  }

  @test('GET /users/:username -> Should return current user profile')
  public async show() {
    const response = await request({
      method: 'GET',
      headers: {
        authorization: `${this.token}`,
      },
      url: `${this.requestUrl}/${this.authUser.username}`,
      json: true,
      resolveWithFullResponse: true,
    });

    const responseBodyData = this.authUser.toPlainObject();

    response.statusCode.should.equal(200);
    response.body.type.should.equal('users');
    response.body.data.should.to.deep.equal(responseBodyData);
  }

  @test('GET /users/:username -> Should return ERROR 400 "Invalid Token"')
  public async showError() {
    // Send different username to url
    const response = await request({
      method: 'GET',
      headers: {
        authorization: `${this.token}`,
      },
      url: `${this.requestUrl}/${this.usersFixtures[1].username}`,
      json: true,
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(400);
    response.body.type.should.equal('error');
    response.body.errors.should.to.have.members(['Invalid Token']);
  }

  @test('GET /users/:username -> Should return ERROR 404 "Not Found"')
  public async showErrorNotFound() {
    // Send different username to url
    const response = await request({
      method: 'GET',
      url: `${this.requestUrl}/not_found`,
      json: true,
      resolveWithFullResponse: true,
      simple: false,
    });

    response.statusCode.should.equal(404);
    response.body.errors.should.to.have.members(['Not Found']);
  }
}
