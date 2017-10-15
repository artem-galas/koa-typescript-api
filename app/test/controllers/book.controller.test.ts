import { suite, test } from 'mocha-typescript';
import * as request from 'request-promise-native';

import {Model} from 'mongoose';
import {TestController} from '../test.helper';

@suite.only('Book Controller')
class BookControllerTest extends TestController {
  constructor() {
    super('books');
  }

  @test('POST /books -> should create a new Book')
  public async create() {
    const response = await request({
      method: 'POST',
      url: this.requestUrl,
      json: true,
      body: this.bookData,
      resolveWithFullResponse: true,
    });

    const responseBody = this.bookData;
    Object.assign(responseBody, {slug: response.body.data.slug});

    response.statusCode.should.equal(201);
    response.body.type.should.equal('books');
    response.body.data.should.to.deep.equal(responseBody);
  }

  @test('GET /books -> should return array of Books')
  public async index() {
    const response = await request({
      method: 'GET',
      url: this.requestUrl,
      json: true,
      resolveWithFullResponse: true,
    });

    response.body['data'].length.should.equal(6);
    response.body.type.should.equal('books');
    response.body['data'][0].should.to.deep.equal(this.booksFixtures[0].toPlainObject());
  }
}
