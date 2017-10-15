import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';
import * as config from 'config';

import {Model} from 'mongoose';
import {userData} from '../fixtures/user.fixture';

import * as jwt from 'jwt-simple';

import { IUserModel, User} from '../../models/user.model';
import {TestController} from './test.controller.interface';

@suite('User Controller without Authorize')
class UserControllerOutAuth extends TestController {

  constructor() {
    super('users');
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
class UserControllerWithAuth extends TestController {
  private authUser: IUserModel;
  private token: string;

  constructor() {
    super('users');
  }

  public async before() {
    this.authUser = await User.create(userData);
    const payload = {
      id: this.authUser._id,
      name: this.authUser.name,
    };
    this.token = jwt.encode(payload, config.get<string>('jwtSecret'));

    await super.before();
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
