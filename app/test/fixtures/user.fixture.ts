import * as faker from 'faker';
import {IUser, IUserModel} from '../../models/user.model';

const user: IUser = {
  name: faker.name.findName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(8),
};

const users: Array<IUser> =  [];
for (let i = 0; i <= 5; i++) {
  users.push({
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(8),
  });
}

const userAuthData: IUser = {
  name: faker.name.findName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(8),
};

export class UserFixture implements IUser {
  public name: string;
  public username: string;
  public email: string;
  public password: string;
  constructor() {
    this.name = faker.name.findName();
    this.username = faker.internet.userName();
    this.email = faker.internet.email();
    this.password = faker.internet.password(8);
  }
}

export const userFixtures = user;

export const usersFixtures = users;

export const userAuthFixtures = userAuthData;
